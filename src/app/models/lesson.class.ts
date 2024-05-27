import { APISchedulesReponseItem } from '../../models/api-schedules-response-item';

export class LessonClass {
  hours: string;
  name: string;
  teachers: string[];
  group: string;
  room: string;

  constructor(value: APISchedulesReponseItem) {
    this.hours = value.hours.replace(' -', ' - ');
    this.name = value.name;
    let teachersTemp = value.teacher.split(',');
    this.teachers = teachersTemp;
    this.group = value.group.trim();
    this.room = value.room.indexOf('@') > -1 ? 'zajęcia zdalne' : value.room;
  }
}
