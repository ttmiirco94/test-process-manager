package helper;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class JSONUtils {
    public static String convertMapToJson(Map<String, String> map) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}