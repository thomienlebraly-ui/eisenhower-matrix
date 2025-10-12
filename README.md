# Advanced Eisenhower Matrix & Daily Planner

> A dynamic and interactive task management application to turn your strategic goals into daily actions.

This project goes beyond a simple Eisenhower Matrix. It's a complete system for visualizing task priorities, planning your day with a drag-and-drop timeline, and ensuring you're always working on what matters most.

![Application Screenshot](placeholder.png)
*(**Note:** You should replace `placeholder.png` with an actual screenshot of your application!)*

---

## About The Project

The core of this application is the **Eisenhower Matrix**, a productivity principle that helps you prioritize tasks by urgency and importance. This app brings the matrix to life with a dynamic, interactive graph.

However, strategic planning is only half the battle. This tool bridges the gap between strategy and execution with a dedicated **"Today's Plan"** page. This second view allows you to build a visual, block-by-block timeline for your day, committing to specific time slots for your most critical tasks.

By seamlessly integrating a high-level strategic overview with a detailed tactical plan, this tool helps you not only decide *what* to do, but *when* to do it.

### Key Features

#### The Matrix View (Strategic Planning)

*   **Interactive Matrix Graph:** Visualize all your tasks on the importance/urgency graph. The graph is not static; it's a living canvas.
*   **Advanced Point & Label Placement:** A smart algorithm prevents points and labels from overlapping. It uses a hybrid approach of circular placement for identical points and a force-directed layout for nearby clusters. Crowded labels are automatically placed with "leader lines" to ensure every task title is always visible and readable.
*   **Task Relationships:**
    *   **Dependencies:** Link a task to another it "depends on." A solid line with an arrow will visualize this relationship on the graph.
    *   **Subtasks:** Assign a task as a "subtask" of a parent. A dotted line will connect them, helping you organize complex projects.
*   **Deadline Forecast Lines:** Red dotted lines on the graph show you where tasks due "Today," in "1 Week," "2 Weeks," and "1 Month" will appear, helping you anticipate future urgency.
*   **Dynamic Priority Scoring:** Tasks are sorted in a "Priority To-Do List" using a weighted formula (`score = (urgency² + 2 * importance²) / max`) to surface the most critical items.
*   **Visual Indicators for 'Today's Tasks':** Tasks scheduled for today are rendered with a distinct "bullseye" style, making them easy to spot on the graph and in the priority list.
*   **Powerful Search & Sort:** A dedicated panel allows you to instantly filter your task list by any field (title, description, importance, etc.), sort by priority, and even use **regular expressions** for advanced searching.

#### The Today's Plan View (Tactical Execution)

*   **Drag-and-Drop Timeline:** A vertical timeline representing your day from morning to night. Drag tasks from a "Task Pool" and drop them onto the schedule to plan your day.
*   **Live Interactive Resizing:** Drag the top or bottom handles of a task block to intuitively adjust its start and end times. A semi-transparent "shadow" shows you a live preview of the result.
*   **Automatic Conflict Layout:** If multiple tasks are scheduled at the same time, the timeline automatically divides the horizontal space to display them side-by-side. Nothing is ever hidden.
*   **Smart Text Display:** The application intelligently decides how to display a task's title and time based on the available space, ensuring maximum readability even for very short events.
*   **Current Time Indicator:** A red line on the timeline shows you the current time, helping you stay on track.

#### Advanced Task Management

*   **Repeating Tasks:** Set tasks to repeat automatically. When you complete a recurring task, a new one is instantly created with a future deadline, perfect for daily or weekly habits.
*   **Task Duplication:** Instantly create a copy of any existing task with a "Duplicate" button.
*   **Full Task Lifecycle:** Includes task completion, a history of completed tasks with a configurable retention period, and the ability to restore or permanently delete old tasks.
*   **Quick Deadline Adjustments:** Use `+` and `-` buttons in the details panel to quickly shift a task's deadline by one day.
*   **Data Persistence:** Your tasks are automatically saved to your browser's local storage.
*   **Import & Export:**
    *   Backup and share your entire setup with JSON import/export (backward-compatible with older backup files).
    *   Export your daily schedule to a standard `.ics` (iCal) file to use in Google Calendar, Outlook, or Apple Calendar.

---

## The Workflow: From Strategy to Action

This tool is designed to support a powerful weekly workflow.

1.  **Strategic Planning (The Matrix Page):** Use the main matrix view to get a "big picture" overview. Add new projects, break them down into smaller tasks using the **subtask** feature, and link any **dependencies**. Adjust importance and deadlines. This is your command center.

2.  **Daily Commitment:** At the start of each day (or the evening before), review your matrix. For tasks you intend to complete, click **"Add to Today's Plan"** in the details panel. This marks them with the special "bullseye" style.

3.  **Daily Execution (The Today's Plan Page):** Switch to the "Today's Plan" page. You'll see your chosen tasks in the "Task Pool," sorted by priority. Drag them onto the timeline to build a concrete, visual schedule for your day.

4.  **The Weekly Review:** Once a week, use the matrix to review your progress. Mark tasks as complete (which will automatically reschedule **repeating tasks**), break down upcoming projects, and ensure your daily actions are aligned with your long-term goals.

---

## Built With

*   [React](https://reactjs.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Lucide React](https://lucide.dev/guide/packages/lucide-react) (for icons)

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You will need `Node.js` (which includes `npm`) and `git` installed on your system.

*   **Node.js:** Download and install it from the official website: [nodejs.org](https://nodejs.org/). It is recommended to use the LTS (Long Term Support) version.
*   **Git:** If you don't have git, you can download it from [git-scm.com](https://git-scm.com/).

### Installation

1.  **Clone the repository**
    Open your terminal or command prompt and run:
    ```sh
    git clone https://github.com/Timotheergd/eisenhower-matrix
    ```

2.  **Navigate to the project directory**
    ```sh
    cd eisenhower-matrix
    ```

3.  **Install NPM packages**
    This will install all the necessary dependencies for the project.
    ```sh
    npm install
    ```

4.  **Run the application**
    This will start the development server, and the application should automatically open in your default web browser at `http://localhost:3000`.
    ```sh
    npm start
    ```

### OS-Specific Prerequisite Installation

If you don't have `Node.js` or `git`, here are quick commands for various operating systems:

*   **Windows (using winget):**
    Open PowerShell and run:
    ```powershell
    winget install OpenJS.NodeJS.LTS
    winget install Git.Git
    ```

*   **macOS (using Homebrew):**
    Open your terminal and run:
    ```sh
    brew install node
    brew install git
    ```

*   **Linux (Debian/Ubuntu):**
    ```sh
    sudo apt update
    sudo apt install nodejs npm git -y
    ```

*   **Linux (Arch Linux):**
    ```sh
    sudo pacman -Syu nodejs npm git
    ```

*   **Linux (Fedora/RHEL/CentOS):**
    ```sh
    sudo dnf install nodejs npm git -y
    ```

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the AGPLv3 License. See `LICENSE` file for more information.

---

## Acknowledgments

*   This project was built iteratively, and I'd like to thank you for the detailed feedback and feature requests that shaped it into what it is today.
*   The Eisenhower Matrix concept, originally from Dwight D. Eisenhower.
