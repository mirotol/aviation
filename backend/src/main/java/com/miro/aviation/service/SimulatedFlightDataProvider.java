package com.miro.aviation.service;

import com.miro.aviation.model.*;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Scope("prototype") // // Create new instance for each client
public class SimulatedFlightDataProvider implements FlightDataProvider {

    private final AttitudeSimulatorService attitudeSim;
    private final AltitudeSimulatorService altitudeSim;
    private final AirspeedSimulatorService speedSim;

    private List<NavPoint> waypoints = new ArrayList<>();
    private int activeWaypointIndex = 0;

    // For now, let's keep simulated position at Helsinki Airport (EFHK)
    private double currentLat = 60.3172;
    private double currentLon = 24.9633;

    private double speedMultiplier = 1.0;
    private long simulatedTime; // Internal clock for the simulation

    private boolean paused = false;

    public SimulatedFlightDataProvider(
            AttitudeSimulatorService attitudeSim,
            AltitudeSimulatorService altitudeSim,
            AirspeedSimulatorService speedSim) {
        this.attitudeSim = attitudeSim;
        this.altitudeSim = altitudeSim;
        this.speedSim = speedSim;
        this.simulatedTime = System.currentTimeMillis();
    }

    @Override
    public List<NavPoint> getFlightPlan() {
        return new ArrayList<>(waypoints);
    }

    @Override
    public void updateFlightPlan(List<NavPoint> waypoints) {
        this.waypoints = new ArrayList<>(waypoints);
        // Reset active index always on update
        this.activeWaypointIndex = 0;
    }

    @Override
    public int getActiveWaypointIndex() {
        return activeWaypointIndex;
    }

    @Override
    public FlightSnapshot getCurrentSnapshot() {
        return new FlightSnapshot(
                simulatedTime,
                getAttitude(),
                getAltitude(),
                getSpeed(),
                null,
                getPosition(),
                activeWaypointIndex
        );
    }

    @Override
    public Attitude getAttitude() {
        return attitudeSim.getCurrentAttitude();
    }

    @Override
    public Altitude getAltitude() {
        return altitudeSim.getCurrentAltitude();
    }

    @Override
    public AirSpeed getSpeed() {
        return speedSim.getCurrentAirSpeed();
    }

    @Override
    public Position getPosition() {
        return new Position(currentLat, currentLon);
    }

    @Override
    public void tick() {
        if (paused) {
            return;
        }

        // Advance the simulation clock by the standard tick (50ms) scaled by speed
        simulatedTime += (long) (50 * speedMultiplier);

        attitudeSim.tick(speedMultiplier);
        altitudeSim.tick(speedMultiplier);
        speedSim.tick(speedMultiplier);
    }

    @Override
    public void setPaused(boolean paused) {
        this.paused = paused;
    }

    @Override
    public void setSpeedMultiplier(double multiplier) {
        this.speedMultiplier = multiplier;
    }
}
