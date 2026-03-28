package signalos.export;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import signalos.report.DailyReport;
import signalos.report.ReportFormatter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class ExportService {

    public void exportToConsole(DailyReport report) {
        ReportFormatter formatter = new ReportFormatter();
        System.out.println(formatter.formatConsoleReport(report));
    }

    public void exportToCsv(DailyReport report, String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path.getParent())) {
                Files.createDirectories(path.getParent());
            }
            
            String csv = "date,mode,trackedMinutes,signalMinutes,noiseMinutes,snr,leverageScore,pis,dwi,operatorScore\n" +
                         String.format("%s,%s,%d,%d,%d,%.2f,%.2f,%.2f,%.2f,%.2f\n",
                                 report.getDate(), report.getMode(), report.getTotalTrackedMinutes(),
                                 report.getTotalSignalMinutes(), report.getTotalNoiseMinutes(),
                                 report.getScores().getSnr(), report.getScores().getLeverageScore(),
                                 report.getScores().getPriorityIntegrity(), report.getScores().getDeepWorkIndex(),
                                 report.getScores().getOperatorScore());
            
            Files.writeString(path, csv);
            System.out.println("Exported CSV to " + filePath);
        } catch (IOException e) {
            System.err.println("Failed to export CSV: " + e.getMessage());
        }
    }

    public void exportToJson(DailyReport report, String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path.getParent())) {
                Files.createDirectories(path.getParent());
            }
            
            Gson gson = new GsonBuilder()
                .registerTypeAdapter(java.time.LocalDate.class, (com.google.gson.JsonSerializer<java.time.LocalDate>) (src, type, ctx) -> new com.google.gson.JsonPrimitive(src.toString()))
                .registerTypeAdapter(java.time.LocalTime.class, (com.google.gson.JsonSerializer<java.time.LocalTime>) (src, type, ctx) -> new com.google.gson.JsonPrimitive(src.toString()))
                .registerTypeAdapter(java.time.LocalDateTime.class, (com.google.gson.JsonSerializer<java.time.LocalDateTime>) (src, type, ctx) -> new com.google.gson.JsonPrimitive(src.toString()))
                .setPrettyPrinting()
                .create();
            String json = gson.toJson(report);
            
            Files.writeString(path, json);
            System.out.println("Exported JSON to " + filePath);
        } catch (IOException e) {
            System.err.println("Failed to export JSON: " + e.getMessage());
        }
    }

}
