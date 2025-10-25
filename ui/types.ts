
export interface Student {
  roll_no: string;
  name: string;
}

export interface Camera {
  camera_id: number;
  name: string;
  ip_address: string;
}

export interface AttendanceRecord {
  attendance_id: number;
  roll_no: string;
  camera_id: number;
  detected_time: string;
  date: string;
}

export interface AttendanceRecordWithName extends AttendanceRecord {
    name: string;
}

export interface DatasetPerson {
    name: string;
    image_count: number;
    images: string[];
}