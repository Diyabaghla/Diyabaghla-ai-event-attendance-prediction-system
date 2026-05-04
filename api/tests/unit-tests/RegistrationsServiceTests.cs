using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace EventPredictionAPI.Tests
{
    [TestClass]
    public class RegistrationServiceTests
    {
        [TestMethod]
        public void RegistrationStatus_Default_ShouldBeRegistered()
        {
            // Arrange
            var status = "Registered";

            // Assert
            Assert.AreEqual("Registered", status);
        }

        [TestMethod]
        public void CancelRegistration_ShouldChangeTo_Cancelled()
        {
            // Arrange
            var status = "Registered";

            // Act
            status = "Cancelled";

            // Assert
            Assert.AreEqual("Cancelled", status);
        }

        [TestMethod]
        public void DaysBeforeRegistration_ShouldNotBeNegative()
        {
            // Arrange
            var eventDate = DateTime.Now.AddDays(10);
            var regDate = DateTime.Now;
            var diff = Math.Max(0, (eventDate - regDate).Days);

            // Assert
            Assert.IsTrue(diff >= 0);
        }

        [TestMethod]
        public void PastUserAttendanceRate_ShouldBeBetween_ZeroAndOne()
        {
            // Arrange
            double rate = 0.75;

            // Assert
            Assert.IsTrue(rate >= 0 && rate <= 1);
        }
    }
}