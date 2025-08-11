from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re

class RegexValidator:
    def validate(self, password, user=None):
        regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$"
        
        if not re.fullmatch(regex, password):
            raise ValidationError(
                _("Password must contain: 10+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character"),
                code='password_weak'
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least: "
            "10 characters, 1 uppercase, 1 lowercase, "
            "1 number, and 1 special character (@$!%*?&)"
        )