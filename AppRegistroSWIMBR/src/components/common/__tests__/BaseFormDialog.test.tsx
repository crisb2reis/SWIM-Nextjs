import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseFormDialog } from '../BaseFormDialog';

test('BaseFormDialog mostra título e chama onClose', async () => {
  const onClose = vi.fn();
  const onSave = vi.fn();

  render(
    <BaseFormDialog
      open={true}
      isSubmitting={false}
      isEditing={false}
      onClose={onClose}
      onSave={onSave}
      icon={<span>ICON</span>}
      title={'Título Teste'}
      subtitle={'Sub'}
      discardLabel={'Cancelar'}
      saveLabel={'Salvar'}
    >
      <div>conteúdo</div>
    </BaseFormDialog>
  );

  expect(screen.getByText('Título Teste')).toBeInTheDocument();

  const cancel = screen.getByText('Cancelar');
  await userEvent.click(cancel);
  expect(onClose).toHaveBeenCalled();
});
