import { useDispatch, useSelector } from "react-redux"
import { onAddNewEvent, onDeleteEvent, onSetActiveEvent, onUpdateEvent, onLoadEvents } from "../store";
import { calendarApi } from "../api";
import { useAuthStore } from "./useAuthStore";
import { convertEvents } from "../helpers";
import Swal from "sweetalert2";

export const useCalendarStore = () => {

    const { events, activeEvent } = useSelector(state => state.calendar);
    const { user } = useAuthStore();
    const dispatch = useDispatch();

    const setActiveEvent = ( calendarEvent ) => {
        dispatch( onSetActiveEvent(calendarEvent) );
    }

    const startSavingEvent = async( calendarEvent ) => {

        try {

            if(calendarEvent.id) {
                await calendarApi.put(`/events/${calendarEvent.id}`, calendarEvent);
                dispatch( onUpdateEvent({ ...calendarEvent, user }));
                return;
            } 
    
            const { data } = await calendarApi.post('/events', calendarEvent);
            dispatch( onAddNewEvent({ ...calendarEvent, id: data.event.id, user }) );    
            
        } catch (error) {
            console.log(error);
            Swal.fire('Error saving data', error.response.data?.msg, 'error');
        }        
    }

    const startDeletingEvent = async() => {

        try {
            
            await calendarApi.delete(`/events/${activeEvent.id}`);
            dispatch(onDeleteEvent());

        } catch (error) {
            console.log(error);
            Swal.fire('Error deleting data', error.response.data?.msg, 'error');
        }
    }

    const starLoadingEvents = async() => {

        try {

            const { data } = await calendarApi.get('/events');
            const events = convertEvents( data.events );
            dispatch(onLoadEvents(events));            
            
        } catch (error) {
            console.log(error);
        }

    }

    return {
        //* Properties
        activeEvent,
        events,
        hasEventSelected: !!activeEvent,

        //* Methods
        setActiveEvent,
        starLoadingEvents,
        startDeletingEvent,
        startSavingEvent,
    }

}