import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TestCrawler {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://lacatruyen.buzz/api/stories/871/chapters?limit=1000"))
                .header("User-Agent", "Mozilla/5.0")
                .build();
        
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response.body());
        JsonNode list = root.path("list");
        
        System.out.println("Total chapters fetched: " + list.size());
        if (list.size() > 0) {
            System.out.println("First chapter title: " + list.get(0).path("title").asText());
        }
    }
}
