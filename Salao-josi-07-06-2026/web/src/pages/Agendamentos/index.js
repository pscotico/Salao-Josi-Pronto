import { useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment'
import { useDispatch ,useSelector } from 'react-redux';
import { filterAgendamentos } from '../../store/modules/agendamento/actions'; // Guilherme #4 1:59:54//
import util from '../../util';  // Guilherme #42:12:00 //

const localizer = momentLocalizer(moment);

const Agendamentos = () => {
  const dispatch = useDispatch();
const { agendamentos } = useSelector((state) => state.agendamento); //Guilherme #4 02:10:52//

const formatEventos = agendamentos.map((agendamento) => ({
  title: `${agendamento.servicoId.titulo} - ${agendamento.clienteId.nome} - ${agendamento.colaboradorId.nome}`,
  start: moment(agendamento.data).toDate(),
    end: moment(agendamento.data)
        .add(
          util.hourToMinutes(
            moment(agendamento.servicoId.duracao).format('HH:mm')
          ),
          'minutes'
        )
        .toDate(),
}));

 const formatRange = (periodo) => {
    if (!periodo) {
      return {
        start: moment().weekday(0).format('YYYY-MM-DD'),
        end: moment().weekday(6).format('YYYY-MM-DD'),
      };
    }

    let finalRange = {};
    if (Array.isArray(periodo)) {
      finalRange = {
        start: moment(periodo[0]).format('YYYY-MM-DD'),
        end: moment(periodo[periodo.length - 1]).format('YYYY-MM-DD'),
      };
    } else {
      finalRange = {
        start: moment(periodo.start).format('YYYY-MM-DD'),
        end: moment(periodo.end).format('YYYY-MM-DD'),
      };
    }

    return finalRange;
  };

  useEffect(() => {
    dispatch(
      filterAgendamentos(
        moment().weekday(0).format('YYYY-MM-DD'),
        moment().weekday(6).format('YYYY-MM-DD')
      )
    );
  }, [dispatch]);

   
    return (
   <div className=" col p-5 overflow-auto h-100">
     <div className="row">
        <div className="col-12">
          <h2 className="mb-4 mt-0">Agendamentos</h2>
          <Calendar 
           localizer={localizer}
          onRangeChange = {(periodo) => {
  const { start, end } = formatRange(periodo);
  dispatch(filterAgendamentos(start, end));
}}
           events={formatEventos} //Guilherme #4 2:13:00 mudei essa linha \\
           defaultView='week'
           selectable
          popup
          style={{ height: 600 }}
    />
        </div>
     </div>
   </div> 
    
    )
};

export default Agendamentos; 
