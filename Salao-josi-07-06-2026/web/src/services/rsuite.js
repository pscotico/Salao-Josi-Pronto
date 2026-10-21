import { Notification, toaster } from 'rsuite';

export const notification = (
  type,
  { placement = 'topStart', title = '', description = '' } = {}
) => {
  toaster.push(
    <Notification type={type} header={title} closable>
      {description}
    </Notification>,
    { placement }
  );
};
