import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class TestJsoup {
    public static void main(String[] args) throws Exception {
        String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        Document apiDoc = Jsoup.connect("https://lacatruyen.buzz/api/stories/871/chapters?limit=5")
                            .ignoreContentType(true)
                            .userAgent(USER_AGENT)
                            .get();
        System.out.println(apiDoc.body().text());
    }
}
