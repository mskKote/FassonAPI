using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs;
using Microsoft.Azure;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Drawing;
using System.IO;
using System;

namespace FassonAPI_ASP.Models.DataBase
{
    /// <summary>
    /// Данный класс занимает роль базы данных в проекте, 
    /// соответственно, реализует интерфейс IDataBase.
    /// 
    /// Класс взаимодействует с хранилищем Azure и 
    /// представлением о пользоватале, классе User.
    /// 
    /// В случае предсказуемой исключительной ситуации 
    /// выкидывает FassonException с сообщением, 
    /// которое увидит пользователь.
    /// </summary>
    public class AzureDataBase : FassonAPI.IFassonDataBase<User>
    {
        #region BaseInteraction
        /// <summary>
        /// Алгоритм аутентификация пользователя.
        /// Является проверкой идентификации полей логина и пароля 
        /// у введённого пользователя и о его представлении в базе данных. 
        /// </summary>
        /// <returns>Заключение проверки</returns>
        public async Task<bool> Authentication(User ProofUser)
        {
            User user;
            try
            {
                user = await DownloadUserData(ProofUser);
            }
            catch (Exception) { throw new FassonException("Account is not exist"); }

            if (ProofUser.Equals(user)) return true;
            throw new FassonException("Incorrect password");
        }
        /// <summary>
        /// Регистрация нового пользователя.
        /// </summary>
        /// <param name="newUser">Представление о пользователе</param>
        public async Task Registration(User NewUser)
        {
            if (await UserExistence(NewUser))
                throw new FassonException("Non unique login");
            await UploadUserData(NewUser);
        }
        /// <summary>
        /// Изменяет данные пользователя в базе данных.
        /// </summary>
        /// <param name="CurrentUser">Текущее представление о пользователе, чьи данные будут изменены</param>
        /// <param name="changedUser">Новые данные пользователя</param>
        public async void UpdateData(User CurrentUser, User changedUser)
        {
            await UploadUserData(changedUser);
        }
        /// <summary>
        /// Получает всех пользователей из хранилища Azure 
        /// для демонстрации работы программы.
        /// </summary>
        /// <returns>пользователи</returns>
        public static async Task<List<User>> GetUsers()
        {
            var users = new List<User>();
            foreach (var blob in BlobContainer.GetBlobs())
            {
                if (!blob.Name.Contains("/"))
                {
                    User userDB = await new AzureDataBase().DownloadUserData(new User(blob.Name.Replace(".xml", ""), ""));
                    if (userDB.FaceID != null)
                        userDB.Portrait = (byte[])new ImageConverter().ConvertTo(
                                                    new Bitmap(await DownloadPortrait(userDB)), typeof(byte[]));
                    users.Add(userDB);
                }
            }
            return users;
        }

        /// <summary>
        /// Проверяет, существует ли пользователь в базе данных.
        /// </summary>
        /// <param name="user">Пользователь, существование которого необходимо проверить</param>
        /// <returns>Заключение проверки</returns>
        private static async Task<bool> UserExistence(User user)
        {
            try
            {
                return (await BlobContainer
                  .GetBlobClient(user.Login + ".xml")
                  .DownloadAsync()).Value.ContentLength != 0;
            }
            catch (Exception) { return false; }
        }
        #endregion BaseInteraction

        #region Secrets
        /// <summary>
        /// Представление о контейнере в хранилище Azure.
        /// </summary>
        private readonly static BlobContainerClient BlobContainer =
            new BlobServiceClient(
                CloudConfigurationManager.GetSetting("fassonStorage"))
                .GetBlobContainerClient("users");
        #endregion Secrets

        #region Upload
        /// <summary>
        /// Загружает данные пользователя.
        /// </summary>
        /// <param name="user">Данные пользователя</param>
        /// <returns></returns>
        private static async Task UploadUserData(User user)
        => await UploadData(user.GetXmlStream(), user.Login + ".xml", "application/xml");

        /// <summary>
        /// Загружает портрет пользователя.
        /// </summary>
        /// <param name="portrait">Портрет в экземпляре Stream</param>
        /// <param name="name">Путь до портрета</param>
        /// <returns></returns>
        public static async Task UploadPortrait(Stream portrait, string name)
        {
            try
            {
                await UploadData(portrait, name, "image/png");
            }
            catch (FassonException) { throw new FassonException("Face registration is not possible"); }
        }

        /// <summary>
        /// Загружает любые данные в хранилище Azure
        /// </summary>
        /// <param name="DataStream">Данные, представленные ввиде экзепляра Stream</param>
        /// <param name="name">Путь до данных в хранилище Azure.</param>
        /// <param name="contentType">MIME-тип, который загружается в хранилище Azure.</param>
        /// <returns></returns>
        public static async Task UploadData(Stream DataStream, string name, string contentType)
        {
            try
            {
                await BlobContainer.SetAccessPolicyAsync(PublicAccessType.None);
                BlobClient blob = BlobContainer.GetBlobClient(name);
                await blob.UploadAsync(DataStream, overwrite: true);
                await blob.SetHttpHeadersAsync(new BlobHttpHeaders() { ContentType = contentType });
            }
            catch (Exception) { throw new FassonException("Registration is not possible"); }
        }
        #endregion Upload

        #region Download
        /// <summary>
        /// Скачивает данные конкретного пользователя из хранилища Azure.
        /// </summary>
        /// <returns>Данные пользователя</returns>
        public async Task<User> DownloadUserData(User NeededUser)
        => User.XmlUserDeserealiser(await DownloadData(NeededUser.Login + ".xml"));

        /// <summary>
        /// Скачивает портрет пользователя.
        /// </summary>
        /// <param name="user">пользователь, чей портрет необходимо получить</param>
        /// <returns>Экземпляр Stream, содержащий портрет пользователя</returns>
        public static async Task<Stream> DownloadPortrait(User user)
            => Task.FromResult(await DownloadData(user.FaceID)).Result;

        /// <summary>
        /// Загружает данные из хранилища Azure.
        /// </summary>
        /// <param name="name">Путь до данных</param>
        /// <returns>Данные в формате экземпляра Stream</returns>
        public static async Task<Stream> DownloadData(string name)
        => (await BlobContainer
                .GetBlobClient(name)
                .DownloadAsync()).Value.Content;
        #endregion Download

        #region Delete
        /// <summary>
        /// Удаляет все данные о пользователе из базы данных.
        /// </summary>
        /// <param name="userToDelete">Представление о пользователе, которого нужно удалить</param>
        public async Task DeleteUser(User userToDelete)
        {
            User userData;
            try
            {
                userData = await DownloadUserData(userToDelete);
                if (!userToDelete.Equals(userData))
                    throw new FassonException("Incorrect password");
            }
            catch (FassonException) { throw; }
            catch (Exception) { throw new FassonException("Account is not exist"); }

            await DeleteData(userData.Login + ".xml");
            if (!string.IsNullOrEmpty(userData.FaceID))
                await DeleteData(userData.FaceID);
        }

        /// <summary>
        /// Удаляет данные из хранилища.
        /// </summary>
        /// <param name="name">Путь до файла</param>
        /// <returns></returns>
        private static async Task DeleteData(string name) =>
            await BlobContainer.DeleteBlobAsync(name, DeleteSnapshotsOption.IncludeSnapshots);
        #endregion Delete
    }
}