using System.Threading.Tasks;

namespace FassonAPI
{
    /// <summary>
    /// Минимальный интерфейс для работы с контроллером, 
    /// необходимый для функционирования FassonAPI.
    /// </summary>
    public interface IFassonController
    {
        /// <summary>
        /// Регистрация по портрету.
        /// </summary>
        /// <returns></returns>
        Task<string> RegFace();
        /// <summary>
        /// Аутентификация по портрету.
        /// </summary>
        /// <returns></returns>
        Task<string> AuthFace();
    }
}
