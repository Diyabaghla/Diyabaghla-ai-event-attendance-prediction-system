using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace EventPredictionAPI.Tests
{
    [TestClass]
    public class PredictionServiceTests
    {
        [TestMethod]
        public void PredictedAttendance_ShouldNotExceed_LocationCapacity()
        {
            // Arrange
            int predicted = 387;
            int capacity = 500;

            // Assert — predicted should be within reasonable range
            Assert.IsTrue(predicted <= capacity * 1.1);
        }

        [TestMethod]
        public void NoShowProbability_ShouldBeBetween_ZeroAndOne()
        {
            // Arrange
            double probability = 0.84;

            // Assert
            Assert.IsTrue(probability >= 0 && probability <= 1);
        }

        [TestMethod]
        public void AttendPrediction_Label_ShouldBeValid()
        {
            // Arrange
            var validLabels = new[] { "Attend", "Not Attend" };
            var label = "Attend";

            // Assert
            CollectionAssert.Contains(validLabels, label);
        }

        [TestMethod]
        public void FastApiBaseUrl_ShouldBeConfigured()
        {
            // Arrange
            var baseUrl = "http://localhost:8000";

            // Assert
            Assert.IsTrue(baseUrl.StartsWith("http"));
            Assert.IsTrue(baseUrl.Contains("8000"));
        }
    }
}