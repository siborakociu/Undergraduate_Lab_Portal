import smtplib
from email.mime.text import MIMEText
from uuid import UUID


class EmailService:
    def __init__(self, smtp_host: str, smtp_port: int, sender: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.sender = sender

    def _send(self, to: str, subject: str, body: str) -> None:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = self.sender
        msg["To"] = to
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.sendmail(self.sender, [to], msg.as_string())
        except Exception:
            pass  # log silently in dev; swap with proper logging in prod

    async def send_decision_email(self, to: str, body: str) -> None:
        self._send(to, "Application Decision", body)

    async def send_reminder_email(self, lab_id: UUID) -> None:
        self._send("admin@labportal.edu", "Lab Cert Reminder", f"Lab {lab_id} cert expiring.")

    async def send_reset_email(self, to: str) -> None:
        self._send(to, "Password Reset", "Click the link to reset your password.")
