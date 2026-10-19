import java.util.List;
public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Ada", "Grace");
        names.stream().map(String::toUpperCase).forEach(System.out::println);
    }
}
