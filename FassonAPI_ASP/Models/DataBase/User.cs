using System.Text;
using System.Xml;
using System.IO;

namespace FassonAPI_ASP.Models.DataBase
{
    /// <summary>
    /// Класс, представляющий пользователя 
    /// и действия с ним, а именно:
    /// сереализацию, десереализацию 
    /// и проверку на идентичность 2-х пользователей.
    /// </summary>
    public class User
    {
        #region Properties
        /// <summary>
        /// Логин аккаунта пользователя.
        /// </summary>
        public string Login { get; private set; }
        /// <summary>
        /// Пароль аккаунта пользователя. 
        /// </summary>
        public string Password { get; private set; }
        /// <summary>
        /// Лицо пользователя, получаемое 
        /// с веб-камеры или из базы данных.
        /// </summary>
        public byte[] Portrait { get; set; }
        /// <summary>
        /// Адрес в базе данных.
        /// </summary>
        public string FaceID { get; set; }
        #endregion

        /// <summary>
        /// Конструктор, создающий аккаунт пользователя
        /// с определёнными свойствами, обязательными из которых
        /// являются логин и пароль.
        /// </summary>
        /// <param name="login">Логин</param>
        /// <param name="password">Пароль</param>
        /// <param name="faceID">Адрес в БД до портрета пользователя</param>
        /// <param name="Portrait">Портрет пользователя</param>
        public User(string login, string password, string faceID = null, byte[] portrait = null)
        {
            Login = login;
            Password = password;
            FaceID = faceID;
            Portrait = portrait;
        }
        /// <summary>
        /// Проверка на идентичность 2-х пользователей. 
        /// Осуществляется путём сравнения логина и пароля.
        /// </summary>
        /// <param name="obj">Другой пользователь</param>
        /// <returns>Заключение проверки</returns>
        public override bool Equals(object obj) =>
                   Login == ((User)obj).Login
             && Password == ((User)obj).Password;

        //---------------------------------------------------XML
        #region serealization
        /// <summary>
        /// Получает экземпляр потока Stream, 
        /// в котором содержится представление о пользователе
        /// в формате XML.
        /// </summary>
        /// <returns>поток с пользователем</returns>
        public Stream GetXmlStream()
        {
            var xmldoc = XmlSerialiser(this);
            Stream stream = new MemoryStream();
            xmldoc.Save(stream);
            stream.Position = 0;
            return stream;
        }
        /// <summary>
        /// Сереализует представление о пользователе
        /// в формат XML.
        /// </summary>
        /// <param name="user">Пользователь для сереализации</param>
        /// <returns>XML-документ, в котором содержится представление о пользователе</returns>
        private static XmlDocument XmlSerialiser(User user)
        {
            var xmlDoc = new XmlDocument();
            xmlDoc.AppendChild(xmlDoc.CreateXmlDeclaration("1.0", Encoding.UTF8.WebName, null));
            var userElement = xmlDoc.CreateElement("UserData");

            userElement.AppendChild(XmlField(xmlDoc, "login", user.Login));
            userElement.AppendChild(XmlField(xmlDoc, "password", user.Password));

            if (!string.IsNullOrEmpty(user.FaceID))
                userElement.AppendChild(XmlField(xmlDoc, "faceID", user.FaceID));

            xmlDoc.AppendChild(userElement);
            return xmlDoc;
        }
        /// <summary>
        /// Данная функция отвечает за то, 
        /// чтобы представить в формате XML
        /// одну характеристику пользователя.
        /// </summary>
        /// <param name="xmlDoc">Документ, в который характеристика будет вложена</param>
        /// <param name="name">Название характеристики</param>
        /// <param name="data">Содержимое характеристики</param>
        /// <returns></returns>
        private static XmlNode XmlField(XmlDocument xmlDoc, string name, string data)
        {
            var NameDataElement = xmlDoc.CreateElement(name);
            NameDataElement.InnerText = data;
            return NameDataElement.Clone();
        }
        #endregion serealization

        #region DEserealization
        public static User XmlUserDeserealiser(Stream UserDataStream)
        {
            var docXml = new XmlDocument();
            docXml.Load(UserDataStream);

            return new User(
                login: FieldData(docXml, "login"),
                password: FieldData(docXml, "password"),
                FieldData(docXml, "faceID") ?? null);
        }
        private static string FieldData(XmlDocument docXml, string name)
        {
            var field = docXml.GetElementsByTagName(name);
            if (field == null || field.Count == 0) return null;
            return field?[0].InnerText;
        }
        #endregion DEserealization
    }
}