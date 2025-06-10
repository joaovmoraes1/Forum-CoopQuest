import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  participants: number;
  type: 'Competicao' | 'Workshop' | 'Meetup';
}

const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error: any) {
        toast.error('Erro ao carregar eventos: ' + (error.response?.data?.message || error.message));
      }
    };
    fetchEvents();
  }, []);

  const handleParticipate = async (eventId: number) => {
    try {
      await api.post(`/events/${eventId}/participate`);
      toast.success('Você se inscreveu no evento com sucesso!');
      setEvents(events.map(event =>
        event.id === eventId ? { ...event, participants: event.participants + 1 } : event
      ));
    } catch (error: any) {
      toast.error('Erro ao participar do evento: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 p-2 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">Eventos Próximos</h2>
      {events.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2 sm:gap-4">
          {events.map(event => (
            <li key={event.id} className="bg-gray-700 p-2 sm:p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                <div className="col-span-1 sm:col-span-2">
                  <h3 className="text-base sm:text-lg font-semibold text-orange-400">{event.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300">{event.description}</p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Data: {event.date} às {event.time}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">Tipo: {event.type}</p>
                  <p className="text-xs sm:text-sm text-gray-400">Participantes: {event.participants}</p>
                </div>
                <button
                  onClick={() => handleParticipate(event.id)}
                  className="w-full sm:w-auto px-2 sm:px-4 py-1 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm sm:text-base"
                >
                  Participar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm sm:text-base text-gray-400">Nenhum evento disponível no momento.</p>
      )}
    </div>
  );
};

export default EventsSection;