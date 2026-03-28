package signalos.scoring;

import signalos.domain.ExecutionMode;

public interface ModeConfig {
    ExecutionMode getMode();
    double getLowLeveragePenaltyMultiplier();
    double getSnrExcellenceThreshold();
    double getBuildSignalBonus();
    boolean appliesMaintainConsistencyBonus();
    double getPisWeight();
    double getInterruptionPenaltyMultiplier();
    double getDeepWorkIndexPassingThreshold();
    double getNoiseTaskPenalty();
}
