using System.Threading.Tasks;

namespace FassonAPI
{
    /// <summary>
    /// Минимальный интерфейс для работы с базой данных, 
    /// необходимый для функционирования FassonAPI.
    /// </summary>
    /// <typeparam name="UserDataClass"></typeparam>
    public interface IFassonDataBase<UserDataClass>
    {
        /// <summary>
        /// Скачивает данные конкретного пользователя из хранилища Azure.
        /// </summary>
        /// <returns>Данные пользователя</returns>
        Task<UserDataClass> DownloadUserData(UserDataClass NeededUser);

        /// <summary>
        /// Регистрация нового пользователя.
        /// </summary>
        /// <param name="newUser">Представление о пользователе</param>
        Task Registration(UserDataClass NewUser);

        /// <summary>
        /// Алгоритм аутентификация пользователя.
        /// Является проверкой идентификации полей логина и пароля 
        /// у введённого пользователя и о его представлении в базе данных. 
        /// </summary>
        /// <returns>Заключение проверки</returns>
        Task<bool> Authentication(UserDataClass ProofUser);

        /// <summary>
        /// Изменяет данные пользователя в базе данных.
        /// </summary>
        /// <param name="CurrentUser">Текущее представление о пользователе, чьи данные будут изменены</param>
        /// <param name="changedUser">Новые данные пользователя</param>
        void UpdateData(UserDataClass CurrentUser, UserDataClass changedUser);

        /// <summary>
        /// Удаляет все данные о пользователе из базы данных.
        /// </summary>
        /// <param name="userToDelete">Представление о пользователе, которого нужно удалить</param>
        Task DeleteUser(UserDataClass userToDelete);
    }
}