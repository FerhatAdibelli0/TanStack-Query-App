import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../utils/http.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isError, isPending, error } = useQuery({
    queryKey: ['events', { eventId: id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    //Optimistic Updating...
    onMutate: async (data) => {
      const newEvent = data.event;
      const previousEvent = queryClient.getQueryState([
        'events',
        { eventId: id },
      ]);
      await queryClient.cancelQueries(['events', { eventId: id }]);
      queryClient.setQueryData(['events', { eventId: id }], newEvent);
      return previousEvent;
    },
    onError: (error, variables, context) => {
      const oldEvent = context.data;
      queryClient.setQueryData(['events', { eventId: id }], oldEvent);
    },
    //Trigger just after mutate completed no matter it is successfull or not
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['event', { eventId: id }] });
    },
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  if (isError) {
    return (
      <>
        <ErrorBlock
          title={'Something went wrong'}
          message={error.info?.message || 'Failed to fetch data'}
        />
        <Link to={'../'}>Okay</Link>
      </>
    );
  }

  if (isPending) {
    return <LoadingIndicator />;
  }

  return (
    <Modal onClose={handleClose}>
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to='../' className='button-text'>
          Cancel
        </Link>
        <button type='submit' className='button'>
          Update
        </button>
      </EventForm>
    </Modal>
  );
}
