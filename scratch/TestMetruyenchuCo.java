import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public class TestMetruyenchuCo {
    public static void main(String[] args) throws Exception {
        String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        Document doc = Jsoup.connect("https://metruyenchu.co/truyen/vuong-gia-thien-ha-2/chuong-1")
                            .userAgent(USER_AGENT)
                            .get();
        System.out.println("h1: " + doc.select("h1").text());
        System.out.println("h2: " + doc.select("h2").text());
        System.out.println("title: " + doc.select("title").text());
        System.out.println(".chapter-title: " + doc.select(".chapter-title").text());
    }
}
