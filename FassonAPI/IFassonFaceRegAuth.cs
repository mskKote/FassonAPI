using System.Threading.Tasks;

namespace FassonAPI
{
    /// <summary>
    /// Минимальный интерфейс для работы 
    /// с системой распознавания и идентификации лиц.
    /// </summary>
    /// <typeparam name="UserDataClass">Структура данных, описывающая пользователя</typeparam>
    public interface IFassonFaceRegAuth<UserDataClass>
    {
        /// <summary>
        /// Алгоритм регистрации лица пользователя.
        /// </summary>
        /// <param name="user">
        /// Представление о пользователе, 
        /// содержащее портрет.
        /// </param>
        /// <returns></returns>
        Task FaceRegister(UserDataClass user);
        /// <summary>
        /// Алгоритм аутентификации пользователя по лицу.
        /// </summary>
        /// <param name="user">        
        /// Представление о пользователе, 
        /// содержащее портрет.
        /// </param>
        /// <returns>Заключение аутентификации</returns>
        Task<bool> FaceAuth(UserDataClass user);
    }
}