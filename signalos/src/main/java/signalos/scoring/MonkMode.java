package signalos.scoring;

import signalos.domain.ExecutionMode;

public class MonkMode implements ModeConfig {
    @Override public ExecutionMode getMode() { return ExecutionMode.MONK; }
    @Override public double getLowLeveragePenaltyMultiplier() { return 1.0; }
    @Override public double getSnrExcellenceThreshold() { return 2.0; }
    @Override public double getBuildSignalBonus() { return 1.0; }
    @Override public boolean appliesMaintainConsistencyBonus() { return false; }
    @Override public double getPisWeight() { return 1.0; }
    @Override public double getInterruptionPenaltyMultiplier() { return 2.5; }
    @Override public double getDeepWorkIndexPassingThreshold() { return 50.0; }
    @Override public double getNoiseTaskPenalty() { return 2.0; }
}
