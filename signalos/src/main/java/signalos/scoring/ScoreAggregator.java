package signalos.scoring;

import signalos.domain.DayPlan;
import signalos.domain.FatigueLevel;
import signalos.domain.FragmentationLevel;
import signalos.domain.Session;
import signalos.engines.DecisionFatigueEngine;
import signalos.engines.DeepWorkEngine;
import signalos.engines.LeverageEngine;
import signalos.engines.PriorityAnalyzer;
import signalos.engines.ResidueAnalyzer;
import signalos.engines.SignalEngine;
import signalos.engines.SwitchAnalyzer;
import signalos.engines.TimeSlotAnalyzer;

import java.util.List;

public class ScoreAggregator {
    private final SignalEngine signalEngine = new SignalEngine();
    private final LeverageEngine leverageEngine = new LeverageEngine();
    private final DeepWorkEngine deepWorkEngine = new DeepWorkEngine();
    private final SwitchAnalyzer switchAnalyzer = new SwitchAnalyzer();
    private final ResidueAnalyzer residueAnalyzer = new ResidueAnalyzer();
    private final PriorityAnalyzer priorityAnalyzer = new PriorityAnalyzer();
    private final TimeSlotAnalyzer timeSlotAnalyzer = new TimeSlotAnalyzer();
    private final DecisionFatigueEngine decisionFatigueEngine = new DecisionFatigueEngine();

    public DayScores aggregate(List<Session> sessions, DayPlan plan, ModeConfig mode) {
        SignalEngine.SignalResult sr = signalEngine.analyze(sessions, plan);
        LeverageEngine.LeverageResult lr = leverageEngine.analyze(sessions, plan, mode);
        DeepWorkEngine.DeepWorkResult dwr = deepWorkEngine.analyze(sessions, plan);
        SwitchAnalyzer.SwitchResult swr = switchAnalyzer.analyze(sessions, plan);
        PriorityAnalyzer.PriorityResult pr = priorityAnalyzer.analyze(sessions, plan);
        TimeSlotAnalyzer.TimeSlotResult tsr = timeSlotAnalyzer.analyze(sessions, plan);
        DecisionFatigueEngine.FatigueResult fr = decisionFatigueEngine.analyze(sessions, plan);
        // Residue calculation is part of insight / standalone but included in score generation if needed

        double snrNorm = Math.min(100.0, (sr.snr / mode.getSnrExcellenceThreshold()) * 100.0);
        double pis = pr.priorityIntegrityScore * mode.getPisWeight();
        
        // OperatorScore = (SNR_normalized×0.25 + LeverageScore×0.25 + PIS×0.25 + DWI×0.25) -- wait, text says SNR_normalized*25. Let's assume weights sum to 1.
        double operatorScore = (snrNorm * 0.25) + (lr.leverageScore * 0.25) + (Math.min(100.0, pis) * 0.25) + (dwr.deepWorkIndex * 0.25);

        FragmentationLevel fragLevel;
        if (swr.burstCount >= 2 || swr.switchCount > 8) fragLevel = FragmentationLevel.HIGH;
        else if (swr.switchCount > 4) fragLevel = FragmentationLevel.MEDIUM;
        else fragLevel = FragmentationLevel.LOW;

        return new DayScores(
                sr.snr,
                lr.leverageScore,
                Math.min(100.0, pis),
                swr.effectiveFocusTime,
                dwr.deepWorkIndex,
                fr.classification,
                fragLevel,
                tsr.primeWindows,
                operatorScore,
                swr.switchCount,
                swr.focusTax
        );
    }
}
