import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../utils/http.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleteing] = useState(false);

  const { data, error, isPending, isError } = useQuery({
    queryKey: ['events', { eventId: id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const { mutate, isPending: pendingForDelete } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      navigate('/events');
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none',
      });
    },
  });

  if (isError) {
    return (
      <ErrorBlock
        title={'Oops! Someting went wrong...'}
        message={error.info?.message || 'Failed to post data'}
      />
    );
  }
  const onHandlerStartDelete = () => {
    setIsDeleteing(true);
  };

  const onHandleStopDelete = () => {
    setIsDeleteing(false);
  };

  const onDeleteEventHandler = (id) => {
    mutate({ id });
  };

  return (
    <>
      {isDeleting && (
        <Modal onClose={onHandleStopDelete}>
          <h2>Are you sure ?</h2>
          <p>
            Do you really want to delete the event.You will not undo anymore
          </p>
          {pendingForDelete && <p>Please wait until deleted</p>}
          {!pendingForDelete && (
            <div className='form-actions'>
              <button onClick={onHandleStopDelete} className='button-text'>
                Cancel
              </button>
              <button
                onClick={onDeleteEventHandler.bind(this, id)}
                className='button'
              >
                Delete
              </button>
            </div>
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to='/events' className='nav-item'>
          View all Events
        </Link>
      </Header>
      <article id='event-details'>
        <header>
          {data && <h1>{data.title}</h1>}{' '}
          <nav>
            <button onClick={onHandlerStartDelete}>Delete</button>
            <Link to='edit'>Edit</Link>
          </nav>
        </header>
        <div id='event-details-content'>
          {!isPending && (
            <>
              <img
                src={`http://localhost:3000/${data.image}`}
                alt={data.image}
              />
              <div id='event-details-info'>
                <div>
                  <p id='event-details-location'>{data.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>{data.date}</time>
                </div>
                <p id='event-details-description'>{data.description}</p>
              </div>
            </>
          )}
          {isPending && (
            <div id='detail-loading'>
              <LoadingIndicator />
            </div>
          )}
        </div>
      </article>
    </>
  );
}
