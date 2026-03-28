package signalos.scoring;

import signalos.domain.ExecutionMode;

public class FounderMode implements ModeConfig {
    @Override public ExecutionMode getMode() { return ExecutionMode.FOUNDER; }
    @Override public double getLowLeveragePenaltyMultiplier() { return 2.0; }
    @Override public double getSnrExcellenceThreshold() { return 3.0; }
    @Override public double getBuildSignalBonus() { return 1.5; }
    @Override public boolean appliesMaintainConsistencyBonus() { return false; }
    @Override public double getPisWeight() { return 1.0; }
    @Override public double getInterruptionPenaltyMultiplier() { return 1.0; }
    @Override public double getDeepWorkIndexPassingThreshold() { return 30.0; }
    @Override public double getNoiseTaskPenalty() { return 1.0; }
}
