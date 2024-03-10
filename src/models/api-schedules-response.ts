import { APISchedulesReponseItem } from "./api-schedules-response-item";

export interface APISchedulesResponse {
    name: string;
    items: APISchedulesReponseItem[];
}