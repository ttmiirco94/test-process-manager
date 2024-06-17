import helper.HTTPSender;
import helper.JSONUtils;
import helper.TestUtilities;
import org.testng.annotations.Test;
import pages.GooglePOM;

import java.util.HashMap;
import java.util.Map;

public class OpenGoogleTest extends TestUtilities {

    @Test(testName = "TST-321")
    public void loadPage() {
        System.out.println("Starting logIn test");

        GooglePOM googlePOM = new GooglePOM(driver);
        googlePOM.goToPage();
        googlePOM.verifyUrl();

        String startedFromAPI = System.getenv("STARTED_FROM_API");
        System.out.println("Check if started from API call. Value: " + startedFromAPI);
        if ("true".equals(startedFromAPI)) {
            // Create a map of key-value pairs
            Map<String, String> jsonMap = new HashMap<>();
            jsonMap.put("seleniumTest", "true");
            jsonMap.put("exampleKey", "exampleValue");
            // Add more key-value pairs as needed

            // Convert map to JSON string
            String jsonBody = JSONUtils.convertMapToJson(jsonMap);

            //Send request
            HTTPSender httpSender = new HTTPSender();
            httpSender.sendTestDataToAPI("OpenGoogleTest", jsonBody);
        }
    }
}