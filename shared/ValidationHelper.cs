namespace Shared
{
    public static class ValidationHelper
    {
        public static bool IsValidEmail(string email)
        {
            // Basic email validation logic
            return !string.IsNullOrEmpty(email) && email.Contains("@");
        }
    }
}