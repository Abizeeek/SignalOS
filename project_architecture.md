# SignalOS Project Architecture Breakdown

The full-stack **SignalOS** project is divided into **four major roles** to separate concerns and maintain a scalable, maintainable codebase.

---

## 1. Frontend (Presentation & Interactive Layer)
This layer is responsible for the user interface, real-time feedback, and the visual aesthetics.

* **Tech Stack**: React 19, Vite, Tailwind CSS 4, Framer Motion, TypeScript.
* **Main Wrapper**: [App.tsx](file:///c:/Users/bdwaj/OneDrive/Desktop/java1/signalos-web/src/App.tsx) acts as the root orchestrator.
* **Key Containers/Components**:
  * `<Sidebar />` and `<Header />`: App navigation and global status.
  * `<Dashboard />`: The main view showing KPI cards and charts (`<PlaceholderChart />`).
  * `<TaskPlanner />` & `<TaskModal />`: Interfaces for creating and managing tasks.
  * `<InsightFeed />`: The stream of real-time insights from the Java backend.
* **Visual Effects (Glow, Squiggle, Glassmorphism)**:
  * **Cursor Glow**: Implemented in [CursorGlow.tsx](file:///c:/Users/bdwaj/OneDrive/Desktop/java1/signalos-web/src/components/CursorGlow.tsx) using `framer-motion`'s `useSpring` to smoothly track the mouse. It uses a `radial-gradient` with `mixBlendMode: 'screen'` to create a dynamic, trailing highlight.
  * **Shimmer & Glow**: [index.css](file:///c:/Users/bdwaj/OneDrive/Desktop/java1/signalos-web/src/index.css) defines custom tailwind utilities like `@utility text-glow` (using `text-shadow: 0 0 10px rgba(...)`) and keyframe animations for the shimmer loading effects.
  * **Glass Panels**: Defined in [index.css](file:///c:/Users/bdwaj/OneDrive/Desktop/java1/signalos-web/src/index.css) under `@utility glass-panel` using `backdrop-filter: blur(16px)` and semi-transparent borders to create a frosted glass effect.
  * **Noise Texture**: `<NoiseOverlay />` applies a static grain image over the entire app to give it a premium, textured feel.

---

## 2. Backend (API & Routing Layer)
This layer acts as the bridge between the frontend and the core Java logic, handling HTTP requests and responses.

* **Tech Stack**: Java 21, Maven, Javalin (Lightweight Web Server), Google Gson for JSON.
* **Core File**: [ApiServer.java](file:///c:/Users/bdwaj/OneDrive/Desktop/java1/signalos/src/main/java/signalos/api/ApiServer.java) is the heart of this layer.
* **Key Responsibilities**:
  * **Routing**: Defines REST endpoints like `GET /api/tasks` and `POST /api/tasks`.
  * **Serialization (DTO Mapping)**: Converts Java domain objects (`Task`) into JSON maps that match the React interfaces, and parses incoming JSON back into Java objects using Gson.
* **Java Principles Used**:
  * **RESTful Design**: Clear separation of HTTP methods (GET for fetching, POST for creating).
  * **Dependency Injection (DI)**: [ApiServer](file:///c:/Users/bdwaj/OneDrive/Desktop/java1/signalos/src/main/java/signalos/api/ApiServer.java#13-101) takes `TaskStore` and `SessionStore` via its constructor, meaning it doesn't create its own dependencies (making it easy to test).
  * **Separation of Concerns (SoC)**: The API layer only handles web requests; it delegates data saving to the persistence layer and logic to the engines.

---

## 3. Intelligence Engines (AI & Analytics Logic)
This is the core "brain" of SignalOS, analyzing user behavior to generate metrics and insights.

* **Location**: `signalos.engines` & `signalos.insight` packages.
* **Key Components**:
  * **Analyzers**: Classes like `PriorityAnalyzer.java` and `DecisionFatigueEngine.java` inspect the session data to calculate how efficiently you are working (e.g., measuring "deep work index" or "attention residue").
  * **Insight Rules**: Classes like `InsightRule9_PisPositive` map directly to specific business rules. They evaluate the current state and emit actionable messages.
* **Java Principles Used**:
  * **Strategy / Rules Pattern**: Separating different insights into their own classes (`InsightRule#...`) makes the system extensible.
  * **Immutability (Records)**: Often uses Java Records for passing immutable data snapshots into these engines to prevent accidental side effects.

---

## 4. Data Management (Persistence & Domain Layer)
This layer handles the structural definitions of the data and how it is saved/loaded.

* **Location**: `signalos.domain` and `signalos.persistence` packages.
* **Domain Models**: Classes like `Task.java`, `Session.java`, and `DayPlan.java` define the core entities of the app using Enums (`SignalType`, `LeverageType`) to strongly type the data.
* **Persistence Stores**: `TaskStore` and `SessionStore` are responsible for disk I/O.
* **Architecture**: 
  * They currently load and save JSON data directly from the filesystem (acting as a local JSON database).
  * **Repository Pattern**: By wrapping the file I/O operations inside `Store` classes, the rest of the app ([ApiServer](file:///c:/Users/bdwaj/OneDrive/Desktop/java1/signalos/src/main/java/signalos/api/ApiServer.java#13-101), `Engines`) interacts with a clean interface (`loadAll()`, `save()`), completely decoupled from the fact that it's using files rather than a SQL database.
