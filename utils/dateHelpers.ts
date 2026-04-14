import { endOfDay, format, startOfDay } from "date-fns";

export function getTodayDateString(){
    return format(new Date(), 'yyyy-MM-dd');
}

export function getStartOfDayTimestamp(date: Date){
    return startOfDay(date).getTime();
}

export function getEndOfDayTimestamp(date: Date){
    return endOfDay(date).getTime();
}

