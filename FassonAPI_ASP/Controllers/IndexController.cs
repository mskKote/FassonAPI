using FassonAPI_ASP.Models.FaceRegAuth;
using FassonAPI_ASP.Models.DataBase;
using FassonAPI_ASP.Models;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Text;
using System.IO;
using System;


namespace FassonAPI_ASP.Controllers
{
    /// <summary>
    /// Класс для взаимодействия с front-end.
    /// 
    /// Для аутентификации и регистрации используются 
    /// классы AzureDataBase и ModuleFaceAPI.
    /// 
    /// Обрабатывает предсказуемые исключительные ситуации, 
    /// FassonException.
    /// </summary>
    public class IndexController : Controller, FassonAPI.IFassonController
    {
        /// <summary>
        /// Возвращает главную страницу, 
        /// при этом подгружая пользователей.
        /// 
        /// GET: Index
        /// </summary>
        /// <returns>Страница представления FassonAPI</returns>
        [HttpGet]
        public async Task<ActionResult> Index() =>
            View(await AzureDataBase.GetUsers());

        #region Accounts
        /// <summary>
        /// Используется для обновления списка аккаунтов.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public void Accounts() =>
            Redirect("/Index/Index");
        /// <summary>
        /// Запрос на удаление аккаунта.
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<string> DeleteAccount()
        {
            try
            {
                var user = await ReqHandler(Request.InputStream);
                if (string.IsNullOrEmpty(user.Password))
                    throw new FassonException("You must fill the empty fields");

                // AZURE!!! /////////////////
                await new AzureDataBase().DeleteUser(user);
                return true.ToString();
            }
            catch (FassonException e) { return e.Message; }

        }
        #endregion Accounts

        #region RA_WithoutFace
        /// <summary>
        /// Алгоритм регистрации пользователя.
        /// </summary>
        /// <returns>Итоговый статус</returns>
        [HttpPost]
        public async Task<string> Registration()
        {
            try
            {
                var user = await ReqHandler(Request.InputStream);
                if (string.IsNullOrEmpty(user.Password))
                    throw new FassonException("You must fill the empty fields");
                // AZURE!!! /////////////////
                await new AzureDataBase().Registration(user);
                return true.ToString();
            }
            catch (FassonException e) { return e.Message; }
        }
        /// <summary>
        /// Алгоритм аутентификации.
        /// </summary>
        /// <returns>Итоговый статус</returns>
        [HttpPost]
        public async Task<string> Authentication()
        {
            try
            {
                return (await new AzureDataBase().Authentication(
                   await ReqHandler(Request.InputStream))).ToString();
            }
            catch (FassonException e) { return e.Message; }
        }
        #endregion 

        #region RA_WithFace
        /// <summary>
        /// Алгоритм регистрации пользователя.
        /// </summary>
        /// <returns>Итоговый статус</returns>
        [HttpPost]
        public async Task<string> RegFace()
        {
            try
            {
                var user = await ReqHandler(Request.InputStream);

                if (string.IsNullOrEmpty(user.Password))
                    throw new FassonException("You must fill the empty fields");

                if (user.Login.Contains("/"))
                    throw new FassonException("Do not use \"/\" in Login");
                user.FaceID = "usersportraits/" + user.Login + ".png";
                await new ModuleFaceAPI().FaceRegister(user);
                return true.ToString();
            }
            catch (FassonException e) { return e.Message; }
        }
        /// <summary>
        /// Привязывает портрет к определённому пользователю
        /// </summary>
        /// <returns>Итоговый статус</returns>
        [HttpPost]
        public async Task<string> LinkFacePortrait()
        {
            try
            {
                var user = await ReqHandler(Request.InputStream);

                if (string.IsNullOrEmpty(user.Password))
                    throw new FassonException("You must fill the empty fields");

                if (user.Login.Contains("/"))
                    throw new FassonException("Do not use \"/\" in Login");

                try
                {
                    if (!user.Equals(await new AzureDataBase().DownloadUserData(user)))
                        throw new FassonException("Incorrect password");
                }
                catch (FassonException) { throw; }
                catch (Exception) { throw new FassonException("Account is not exist"); }

                user.FaceID = "usersportraits/" + user.Login + ".png";

                await new ModuleFaceAPI().FaceRegister(user);
                return true.ToString();
            }
            catch (FassonException e) { return e.Message; }
        }
        /// <summary>
        /// Алгоритм аутентификации.
        /// </summary>
        /// <returns>Итоговый статус</returns>
        [HttpPost]
        public async Task<string> AuthFace()
        {
            try
            {
                var user = await ReqHandler(Request.InputStream);
                user.FaceID = "usersportraits/" + user.Login + ".png";
                return Task.FromResult((await new ModuleFaceAPI().FaceAuth(user)).ToString()).Result;
            }
            catch (FassonException e) { return e.Message; }
        }
        #endregion

        /// <summary>
        /// Обработка полученных данных с запроса.
        /// </summary>
        /// <param name="request">Полученные данные</param>
        /// <returns>Полученные данные представляются при помощи класса User</returns>
        private static async Task<User> ReqHandler(Stream request)
        {
            string[] req = new string[3];
            byte[] image = null;
            using (var reader = new StreamReader(request))
            {   //Обработка полученного запроса
                //`Login=${Login.value}&Password=${Password.value}&Face=${dataImg}`
                req = (await reader.ReadToEndAsync()).Split('&');
            }
            // Логин
            string login = req[0].Substring(req[0].IndexOf("Login=") + 6);
            if (login.Contains("/"))
                throw new FassonException("Do not use \"/\" in Login");
            if (string.IsNullOrEmpty(login))
                throw new FassonException("You must fill the empty fields");
            // Пароль
            string password = req[1].Substring(req[1].IndexOf("Password=") + 9);

            // Портрет, если таковой есть.
            if (req.Length == 3)
                image = Convert.FromBase64String(
                         req[2].Substring(req[2].IndexOf("base64,") + 7));

            return new User(login, password, portrait: image);
        }
        /// <summary>
        /// Обрабатывает полученные отзывы.
        /// Складирует их в базе данных.
        /// </summary>
        /// <param name="feedBack">Отзыв</param>
        /// <returns>Перенаправляет на главную страницу</returns>
        [HttpPost]
        public async Task<ActionResult> FeedBack(string feedBack)
        {
            await AzureDataBase.UploadData(
                 new MemoryStream(Encoding.UTF8.GetBytes(feedBack)),
                 "FeedBack/_" + DateTime.Now.ToString().Replace('/', '.') + "_.txt",
                 "text/plain");

            return Redirect("~/Index/Index");
        }
    }
}