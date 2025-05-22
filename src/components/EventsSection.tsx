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
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Eventos Próximos</h2>
      {events.length > 0 ? (
        <ul className="space-y-4">
          {events.map(event => (
            <li key={event.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-orange-400">{event.title}</h3>
                  <p className="text-gray-300">{event.description}</p>
                  <p className="text-gray-400">
                    Data: {event.date} às {event.time}
                  </p>
                  <p className="text-gray-400">Tipo: {event.type}</p>
                  <p className="text-gray-400">Participantes: {event.participants}</p>
                </div>
                <button
                  onClick={() => handleParticipate(event.id)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Participar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">Nenhum evento disponível no momento.</p>
      )}
    </div>
  );
};

export default EventsSection;