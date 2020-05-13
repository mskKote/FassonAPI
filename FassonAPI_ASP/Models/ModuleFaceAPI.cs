using Microsoft.Azure.CognitiveServices.Vision.Face.Models;
using Microsoft.Azure.CognitiveServices.Vision.Face;
using FassonAPI_ASP.Models.DataBase;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Configuration;
using System.IO;

namespace FassonAPI_ASP.Models.FaceRegAuth
{
    /// <summary>
    /// Данный класс занимает роль системы распознавания и идентификации лиц в проекте, 
    /// соответственно, реализует интерфейс IFaceRegAuth.
    /// 
    /// Класс взаимодействует с базой данныхЮ представленной в классе AzureDataBaseAzure и 
    /// представлением о пользоватале, классе User.
    /// 
    /// В случае предсказуемой исключительной ситуации 
    /// выкидывает FassonException с сообщением, 
    /// которое увидит пользователь.
    /// </summary>
    public class ModuleFaceAPI : FassonAPI.IFassonFaceRegAuth<User>
    {
        #region Secrets
        /// <summary>
        /// Авторизированное представление IFaceClient для работы с FaceAPI.
        /// </summary>
        private static readonly IFaceClient Client =
            new FaceClient(new ApiKeyServiceClientCredentials(
                ConfigurationManager.AppSettings.Get("FaceAPIKey")))
            {
                Endpoint =
                ConfigurationManager.AppSettings.Get("FaceAPIEndpoint")
            };
        #endregion Secrets

        #region FaceAPI
        /// <summary>
        /// Алгоритм регистрации лица пользователя.
        /// </summary>
        /// <param name="user">
        /// Представление о пользователе, 
        /// содержащее портрет.
        /// </param>
        /// <returns></returns>
        public async Task FaceRegister(User user)
        {
            try
            {
                // Отлов ошибки, когда пользователь пытается заново зарегистрировать аккаунт
                // с другими данными.
                try
                {
                    if (!user.Equals(await new AzureDataBase().DownloadUserData(user)))
                        throw new FassonException("Incorrect password");
                }
                catch (FassonException) { throw; }
                catch (System.Exception) { }

                await AnalysisFrame(user.Portrait);
                // AZURE!!! /////////////////
                new AzureDataBase().UpdateData(user, user);
                using (Stream stream = new MemoryStream(user.Portrait))
                    await AzureDataBase.UploadPortrait(stream, user.FaceID);
                /////////////////////////////
            }
            catch (FassonException) { throw; }
            catch (System.Exception) { throw new FassonException("Face registration is not possible"); }
        }

        /// <summary>
        /// Алгоритм аутентификации пользователя по лицу.
        /// </summary>
        /// <param name="user">        
        /// Представление о пользователе, 
        /// содержащее портрет.
        /// </param>
        /// <returns>Заключение аутентификации</returns>
        public async Task<bool> FaceAuth(User user)
        {
            try
            {
                Stream userPortrait;
                // В целях экономии первым делом добудем настоящие данные пользователя.
                try { await new AzureDataBase().DownloadUserData(user); }
                catch (System.Exception) { throw new FassonException("Account is not exist"); }

                try { userPortrait = await AzureDataBase.DownloadPortrait(user); }
                catch (System.Exception) { throw new FassonException("Account is not link to any Portrait"); }

                IList<DetectedFace> CurrentIDs = await AnalysisFrame(user.Portrait);

                var TrueFace = await Client.Face.DetectWithStreamAsync(userPortrait);
                if ((await Client.Face.VerifyFaceToFaceAsync(
                    CurrentIDs[0].FaceId.Value,
                    TrueFace[0].FaceId.Value)
                    ).Confidence > 0.7)
                    return true;
                throw new FassonException("This account is registered to another person");
            }
            catch (FassonException) { throw; }
            catch (System.Exception) { throw new FassonException("Face authentication is not possible"); }
        }

        /// <summary>
        /// Анализирует кадр из камеры. 
        /// Находит лица и проверяет их количество. 
        /// </summary>
        /// <param name="frame">Кадр из камеры</param>
        /// <returns>Найденные лица</returns>
        private static async Task<IList<DetectedFace>> AnalysisFrame(byte[] frame)
        {
            IList<DetectedFace> IDs;
            using (Stream stream = new MemoryStream(frame))
                IDs = await Client.Face.DetectWithStreamAsync(stream);

            AmountFacesCheck(IDs.Count);

            return IDs;
        }

        /// <summary>
        /// Функция, служащая для единственной цели:
        /// проверки количества лиц в кадре.
        /// Если не одно, то выкидывает соответсвующий экземпляры FassonException
        /// </summary>
        /// <param name="IDs">Количество ID</param>
        private static void AmountFacesCheck(int IDs)
        {
            if (IDs > 1)
                throw new FassonException("Make sure you are alone in the frame");
            if (IDs == 0)
                throw new FassonException("Make sure you hit the frame");
        }
        #endregion FaceAPI
    }
}