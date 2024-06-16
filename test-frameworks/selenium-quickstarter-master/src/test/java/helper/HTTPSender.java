package helper;

import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

public class HTTPSender {

    private final String username = "admin";
    private final String password = "admin123!";
    private final String baseUrl = "http://localhost:3001";

    public void sendTestDataToAPI(String testID, String jsonBody) {
        String url = baseUrl + "/store-test-data/" + testID;

        // Set up the credentials provider
        CredentialsProvider credsProvider = new BasicCredentialsProvider();
        credsProvider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(username, password)
        );

        try (CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultCredentialsProvider(credsProvider)
                .build()) {

            HttpPost postRequest = new HttpPost(url);
            postRequest.setHeader("Content-Type", "application/json");
            postRequest.setEntity(new StringEntity(jsonBody));

            try (CloseableHttpResponse response = httpClient.execute(postRequest)) {
                String responseBody = EntityUtils.toString(response.getEntity());
                System.out.println("Response: " + responseBody);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
