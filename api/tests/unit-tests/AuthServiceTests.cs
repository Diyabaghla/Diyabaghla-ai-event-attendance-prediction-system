using Microsoft.VisualStudio.TestTools.UnitTesting;
using EventPredictionAPI.Services;

namespace EventPredictionAPI.Tests
{
    [TestClass]
    public class AuthServiceTests
    {
        [TestMethod]
        public void HashPassword_ShouldReturnValidHash()
        {
            // Arrange
            var password = "Test@1234";

            // Act
            var hashed = BCrypt.Net.BCrypt.HashPassword(password);

            // Assert
            Assert.IsTrue(BCrypt.Net.BCrypt.Verify(password, hashed));
        }

        [TestMethod]
        public void VerifyPassword_WithWrongPassword_ShouldFail()
        {
            // Arrange
            var correctPassword = "correct123";
            var wrongPassword = "wrong123";
            var hashed = BCrypt.Net.BCrypt.HashPassword(correctPassword);

            // Act
            var result = BCrypt.Net.BCrypt.Verify(wrongPassword, hashed);

            // Assert
            Assert.IsFalse(result);
        }

        [TestMethod]
        public void DefaultUserRole_ShouldBeUser()
        {
            // Arrange
            var role = "User";

            // Assert
            Assert.AreEqual("User", role);
        }
    }
}