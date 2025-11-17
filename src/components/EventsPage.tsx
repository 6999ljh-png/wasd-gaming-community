import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Trophy, Users, Clock, Plus, MapPin, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Event {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  game: string;
  type: 'tournament' | 'casual' | 'practice';
  startDate: string;
  endDate: string | null;
  maxParticipants: number | null;
  prize: string;
  participants: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  creator?: {
    name: string;
    avatar: string;
  };
}

interface EventsPageProps {
  user: any;
  accessToken: string;
}

export function EventsPage({ user, accessToken }: EventsPageProps) {
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('upcoming');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    game: '',
    type: 'casual',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    prize: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filterStatus]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/events`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    if (filterStatus === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((event) => event.status === filterStatus));
    }
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.game || !newEvent.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...newEvent,
            maxParticipants: newEvent.maxParticipants ? parseInt(newEvent.maxParticipants) : null,
          }),
        }
      );

      if (response.ok) {
        toast.success('Event created successfully!');
        setCreateDialogOpen(false);
        setNewEvent({
          title: '',
          description: '',
          game: '',
          type: 'casual',
          startDate: '',
          endDate: '',
          maxParticipants: '',
          prize: '',
        });
        loadEvents();
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/events/${eventId}/join`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Successfully joined the event!');
        loadEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const leaveEvent = async (eventId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/events/${eventId}/leave`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('You have left the event');
        loadEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to leave event');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tournament':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'casual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'practice':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-slate-900 dark:text-white mb-2">
              {t('events.title') || 'Events & Tournaments'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {t('events.description') || 'Join or create gaming events and tournaments'}
            </p>
          </div>

          <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('events.create') || 'Create Event'}
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <div className="flex gap-2">
            {['upcoming', 'ongoing', 'completed', 'all'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {t(`events.status.${status}`) || status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="mb-2 text-slate-900 dark:text-white">
              {t('events.noEvents') || 'No events found'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t('events.noEventsDescription') || 'Be the first to create an event!'}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('events.create') || 'Create Event'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isParticipant = event.participants.includes(user.id);
              const isCreator = event.creatorId === user.id;
              const isFull = event.maxParticipants && event.participants.length >= event.maxParticipants;

              return (
                <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="mb-2 text-slate-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span>{event.game}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.participants.length}
                        {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                      </span>
                    </div>
                    {event.prize && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Trophy className="w-4 h-4" />
                        <span>{event.prize}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    {event.creator && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={event.creator.avatar} />
                          <AvatarFallback>{event.creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {event.creator.name}
                        </span>
                      </div>
                    )}

                    {event.status === 'upcoming' && !isCreator && (
                      <Button
                        size="sm"
                        variant={isParticipant ? 'outline' : 'default'}
                        onClick={() => isParticipant ? leaveEvent(event.id) : joinEvent(event.id)}
                        disabled={!isParticipant && isFull}
                        className={!isParticipant && !isFull ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      >
                        {isParticipant 
                          ? (t('events.leave') || 'Leave') 
                          : isFull 
                            ? (t('events.full') || 'Full') 
                            : (t('events.join') || 'Join')}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Event Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('events.createNew') || 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {t('events.createDescription') || 'Fill in the details to create a new event'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                  {t('events.form.title') || 'Event Title'} *
                </label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                  {t('events.form.description') || 'Description'}
                </label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    {t('events.form.game') || 'Game'} *
                  </label>
                  <Input
                    value={newEvent.game}
                    onChange={(e) => setNewEvent({ ...newEvent, game: e.target.value })}
                    placeholder="Game name"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    {t('events.form.type') || 'Type'} *
                  </label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tournament">Tournament</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    {t('events.form.startDate') || 'Start Date'} *
                  </label>
                  <Input
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    {t('events.form.endDate') || 'End Date'}
                  </label>
                  <Input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    {t('events.form.maxParticipants') || 'Max Participants'}
                  </label>
                  <Input
                    type="number"
                    min="2"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    {t('events.form.prize') || 'Prize'}
                  </label>
                  <Input
                    value={newEvent.prize}
                    onChange={(e) => setNewEvent({ ...newEvent, prize: e.target.value })}
                    placeholder="e.g., $100, Trophy"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button onClick={createEvent} className="bg-purple-600 hover:bg-purple-700">
                  {t('events.createButton') || 'Create Event'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
