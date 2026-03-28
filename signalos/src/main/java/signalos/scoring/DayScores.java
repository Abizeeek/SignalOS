package signalos.scoring;

import signalos.domain.FatigueLevel;
import signalos.domain.FragmentationLevel;

import java.util.Collections;
import java.util.List;

public class DayScores {
    private final double snr;
    private final double leverageScore;
    private final double priorityIntegrity;
    private final int effectiveFocusTime;
    private final double deepWorkIndex;
    private final FatigueLevel fatigueLevel;
    private final FragmentationLevel fragmentationLevel;
    private final List<String> primeWindows;
    private final double operatorScore;
    private final int switchCount;
    private final int focusTax;

    public DayScores(double snr, double leverageScore, double priorityIntegrity, 
                     int effectiveFocusTime, double deepWorkIndex, 
                     FatigueLevel fatigueLevel, FragmentationLevel fragmentationLevel, 
                     List<String> primeWindows, double operatorScore,
                     int switchCount, int focusTax) {
        this.snr = snr;
        this.leverageScore = leverageScore;
        this.priorityIntegrity = priorityIntegrity;
        this.effectiveFocusTime = effectiveFocusTime;
        this.deepWorkIndex = deepWorkIndex;
        this.fatigueLevel = fatigueLevel;
        this.fragmentationLevel = fragmentationLevel;
        this.primeWindows = primeWindows != null ? List.copyOf(primeWindows) : Collections.emptyList();
        this.operatorScore = operatorScore;
        this.switchCount = switchCount;
        this.focusTax = focusTax;
    }

    public double getSnr() { return snr; }
    public double getLeverageScore() { return leverageScore; }
    public double getPriorityIntegrity() { return priorityIntegrity; }
    public int getEffectiveFocusTime() { return effectiveFocusTime; }
    public double getDeepWorkIndex() { return deepWorkIndex; }
    public FatigueLevel getFatigueLevel() { return fatigueLevel; }
    public FragmentationLevel getFragmentationLevel() { return fragmentationLevel; }
    public List<String> getPrimeWindows() { return primeWindows; }
    public double getOperatorScore() { return operatorScore; }
    public int getSwitchCount() { return switchCount; }
    public int getFocusTax() { return focusTax; }
}
