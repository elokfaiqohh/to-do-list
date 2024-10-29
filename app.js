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
              icon: 'images/notifikasi.png',
              tag: 'to-do-reminder'
          });
      } else {
          console.warn('Izin notifikasi tidak diberikan.');
      }
  }
}

// Kelas turunan untuk alarm
class AlarmReminder extends Reminder {
  trigger() {
      const alarmSound = document.getElementById('alarmSound');
      if (alarmSound) {
          alarmSound.play();
      }
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
          swal('Tugas dan waktu tidak boleh kosong!');
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


  // renderTask(task) {
  //     const li = document.createElement('li');
  //     li.id = task.id;

  //     const taskInfo = document.createElement('div');
  //     taskInfo.className = 'task-info';
  //     taskInfo.textContent = `${task.title} - ${task.time.toLocaleString()}`;

  //     const editButton = document.createElement('button');
  //     editButton.textContent = 'Edit';
  //     editButton.onclick = () => this.editTask(task.id);

  //     const deleteButton = document.createElement('button');
  //     deleteButton.textContent = 'Hapus';
  //     deleteButton.onclick = () => this.deleteTask(task.id);

  //     li.appendChild(taskInfo);
  //     li.appendChild(editButton);
  //     li.appendChild(deleteButton);
  //     this.taskListElement.appendChild(li);
  // }

  renderTask(task) {
    const li = document.createElement('li');
    li.id = task.id;

    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';
    taskInfo.textContent = `${task.title} - ${task.time.toLocaleString()}`;

    // Gambar untuk tombol edit
    const editButton = document.createElement('img');
    editButton.src = 'images/edit.png'; // Ganti dengan path ke gambar edit Anda
    editButton.alt = 'Edit';
    editButton.style.cursor = 'pointer'; // Mengubah kursor saat hover
    editButton.onclick = () => this.editTask(task.id); // Menambahkan event onclick

    // Gambar untuk tombol hapus
    const deleteButton = document.createElement('img');
    deleteButton.src = 'images/hapus.png'; // Ganti dengan path ke gambar hapus Anda
    deleteButton.alt = 'Hapus';
    deleteButton.style.cursor = 'pointer'; // Mengubah kursor saat hover
    deleteButton.onclick = () => this.deleteTask(task.id); // Menambahkan event onclick

    // Menambahkan elemen ke dalam li
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
    
    // Pastikan task.time adalah objek Date yang valid
    if (!(task.time instanceof Date) || isNaN(task.time.getTime())) {
        swal('Waktu yang diatur tidak valid!');
        return;
    }

    // Waktu untuk pengingat 5 menit sebelum
    const reminderTimeBefore = task.time.getTime() - 5 * 60 * 1000; 
    const delayBefore = reminderTimeBefore - now;

    // Waktu untuk pengingat pada waktu yang diatur
    const delay = task.time.getTime() - now;

    // Set pengingat 5 menit sebelum
    if (delayBefore > 0) {
        setTimeout(() => {
            new AlarmReminder(task.title, task.time).trigger();
            new NotificationReminder(task.title, task.time).trigger();
        }, delayBefore);
    } else if (delayBefore <= 0 && delay > 0) {
        // Jika waktu 5 menit sebelumnya sudah lewat tapi waktu yang diatur masih di masa depan
        console.log('Pengingat 5 menit sebelumnya sudah lewat, tetapi pengingat pada waktu yang diatur akan tetap diatur.');
    } else {
        swal('Waktu pengingat harus di masa depan!');
    }

    // Set pengingat pada waktu yang diatur
    if (delay > 0) {
        setTimeout(() => {
            new AlarmReminder(task.title, task.time).trigger();
            new NotificationReminder(task.title, task.time).trigger();
        }, delay);
    } else {
        swal('Waktu pengingat harus di masa depan!');
    }
}

  saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}

// Meminta izin notifikasi
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
      console.log('Izin notifikasi diberikan.');
  } else {
      console.warn('Izin notifikasi tidak diberikan.');
  }
});

// Inisialisasi TaskManager
const taskManager = new TaskManager();