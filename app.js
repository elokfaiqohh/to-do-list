// Kelas abstrak Reminder
class Reminder {
  constructor(taskTitle, scheduledTime) {
    if (this.constructor === Reminder) {
      throw new Error("Kelas abstrak tidak dapat diinstansiasi.");
    }
    this.taskTitle = taskTitle;
    this.scheduledTime = scheduledTime;
  }

  trigger() {
    throw new Error("Metode 'trigger()' harus diimplementasikan.");
  }
}

// Kelas turunan untuk notifikasi
class NotificationReminder extends Reminder {
  trigger() {
    if (Notification.permission === 'granted') {
      new Notification('Pengingat Tugas!', {
        body: `Segera kerjakan: ${this.taskTitle}`,
        icon: 'https://via.placeholder.com/100',
        tag: 'to-do-reminder'
      });
    }
  }
}

// Kelas turunan untuk alarm
class AlarmReminder extends Reminder {
  trigger() {
    const alarmSound = document.getElementById('alarmSound');
    alarmSound.play();
  }
}

// Kelas Task yang menyimpan data tugas
class Task {
  constructor(id, title, time) {
    this.id = id;
    this.title = title;
    this.time = time;
  }
}

// Kelas TaskManager untuk mengelola daftar tugas
class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.taskListElement = document.getElementById('taskList');
    this.renderAllTasks();
  }

  addTask() {
    const taskInput = document.getElementById('taskInput');
    const timeInput = document.getElementById('timeInput');

    if (taskInput.value.trim() === '' || !timeInput.value) {
      alert('Tugas dan waktu tidak boleh kosong!');
      return;
    }

    const task = new Task(Date.now(), taskInput.value, new Date(timeInput.value));
    this.tasks.push(task);
    this.saveTasks();
    this.renderTask(task);

    this.scheduleReminders(task);

    taskInput.value = '';
    timeInput.value = '';
  }

  renderAllTasks() {
    this.tasks.forEach(task => this.renderTask(task));
  }

  renderTask(task) {
    const li = document.createElement('li');
    li.id = task.id;

    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';
    taskInfo.textContent = `${task.title} - ${task.time.toLocaleString()}`;

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => this.editTask(task.id);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Hapus';
    deleteButton.onclick = () => this.deleteTask(task.id);

    li.appendChild(taskInfo);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    this.taskListElement.appendChild(li);
  }

  editTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    const newTitle = prompt('Ubah nama tugas:', task.title);
    if (newTitle) {
      task.title = newTitle;
      this.saveTasks();
      document.getElementById(taskId).querySelector('.task-info').textContent =
        `${task.title} - ${task.time.toLocaleString()}`;
    }
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveTasks();
    const taskElement = document.getElementById(taskId);
    this.taskListElement.removeChild(taskElement);
  }

  scheduleReminders(task) {
    const now = new Date().getTime();
    const reminderTime = task.time.getTime() - 5 * 60 * 1000;
    const delay = reminderTime - now;

    if (delay > 0) {
      setTimeout(() => {
        new AlarmReminder(task.title, task.time).trigger();
        new NotificationReminder(task.title, task.time).trigger();
      }, delay);
    } else {
      alert('Waktu pengingat harus di masa depan!');
    }
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}

// Inisialisasi TaskManager
const taskManager = new TaskManager();

// Meminta izin notifikasi
Notification.requestPermission();
