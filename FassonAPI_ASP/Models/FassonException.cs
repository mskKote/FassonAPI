using System;

namespace FassonAPI_ASP.Models
{
    /// <summary>
    /// Данный класс ошибки служит для оповещения пользователя.
    /// </summary>
    public class FassonException : Exception
    {
        public FassonException()
        {
        }
        public FassonException(string message) : base(message)
        {
        }
        public FassonException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}