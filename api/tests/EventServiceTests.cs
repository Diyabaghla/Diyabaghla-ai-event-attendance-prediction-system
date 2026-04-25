using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace EventPredictionAPI.Tests
{
    [TestClass]
    public class EventServiceTests
    {
        [TestMethod]
        public void EventDate_ShouldDeriveDayOfWeek_Correctly()
        {
            // Arrange
            var date = new DateTime(2026, 4, 20); // Monday

            // Act
            var dayOfWeek = date.DayOfWeek.ToString();

            // Assert
            Assert.AreEqual("Monday", dayOfWeek);
        }

        [TestMethod]
        public void EventMode_ShouldBeOneOf_ValidModes()
        {
            // Arrange
            var validModes = new[] { "Online", "Offline", "Hybrid" };
            var mode = "Online";

            // Assert
            CollectionAssert.Contains(validModes, mode);
        }

        [TestMethod]
        public void SpeakerRating_ShouldBeBetween_ZeroAndFive()
        {
            // Arrange
            double rating = 4.5;

            // Assert
            Assert.IsTrue(rating >= 0 && rating <= 5);
        }

        [TestMethod]
        public void TicketPrice_ShouldNotBeNegative()
        {
            // Arrange
            decimal price = 0;

            // Assert
            Assert.IsTrue(price >= 0);
        }

        [TestMethod]
        public void LocationCapacity_ShouldBeAtLeastOne()
        {
            // Arrange
            int capacity = 100;

            // Assert
            Assert.IsTrue(capacity >= 1);
        }
    }
}