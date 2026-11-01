import { CONDITIONS, MANIPULATION_STATUS, createSession, createTrial, transitionTrial, sealTrial } from "./observor-assets/js/domain-core.js";

const $ = id => document.getElementById(id);
const state = { protocol: null, session: null, active: null, records: [], startedAt: 0 };
const stamp = () => new Date().toISOString();
const val = id => $(id).value.trim();
const say = message => { $("status").textContent = message; };
const procedures = () => Object.fromEntries(CONDITIONS.map((c,i)=>[c,{procedure_id:val("pid"+i),description:val("proc"+i)}]));
function protocolFromForm() {
  return {
    study_id: val("study"), protocol_version: val("version"), research_question: val("question"),
    candidate_property: val("candidate"), history_definition: val("history"),
    experimental_unit: val("unit"),
    task: {task_id:val("taskId"),task_version:val("taskVersion"),description:val("taskDesc"),response_format:val("responseFormat")},
    perturbation: {perturbation_id:val("perturbId"),perturbation_version:val("perturbVersion"),description:val("perturbDesc")},
    condition_procedures: procedures()
  };
}
function reportError(error) {
  $("errors").textContent = error.details?.join("\n") || error.message;
  say("Action not completed. Resolve the protocol or state error.");
}
function update() {
  $("sessionInfo").textContent = state.session ? `Session ${state.session.session_id} · Participant ${state.session.participant_id} · ${state.records.length} trial(s)` : "No session open.";
  $("trialList").textContent = state.records.length ? state.records.map(t=>`${t.trial_index}. ${t.assigned_condition} · ${t.status} · ${t.trial_id}`).join("\n") : "No trials recorded.";
  $("export").disabled = !state.session;
  $("begin").disabled = !state.session || !!state.active;
  $("capture").disabled = !state.active;
  $("abort").disabled = !state.active;
}
$("openSession").onclick = () => {
  try {
    state.protocol = protocolFromForm();
    state.session = createSession({studyId:state.protocol.study_id,participantId:val("participant"),protocolVersion:state.protocol.protocol_version,instrumentBuild:"OBSERVOR-2.0-recorder-dev"});
    state.records = []; state.active = null; $("errors").textContent="";
    say("Session opened in memory. No data have been uploaded or durably saved."); update();
  } catch(e) { reportError(e); }
};
$("begin").onclick = () => {
  try {
    const condition = $("condition").value;
    const trial = createTrial(state.session,state.protocol,condition,{now:stamp()});
    transitionTrial(trial,"config_frozen",{at:stamp()});
    transitionTrial(trial,"started",{at:stamp()});
    const mstatus = $("manipulationStatus").value;
    transitionTrial(trial,"manipulation_recorded",{at:stamp(),manipulation_status:mstatus,evidence:val("manipulationEvidence")||null,deviation:val("deviation")||null});
    transitionTrial(trial,"task_presented",{at:stamp(),task_result:{task_id:state.protocol.task.task_id,task_version:state.protocol.task.task_version,presentation:"operator_confirmed_task_presentation",description:state.protocol.task.description}});
    state.active=trial; state.startedAt=performance.now();
    $("activeInfo").textContent=`Active ${condition} · ${trial.trial_id} · ${trial.configuration_snapshot.condition_procedure.description}`;
    say("Trial started. Assigned condition is not proof that the manipulation succeeded."); update();
  } catch(e) { reportError(e); }
};
$("capture").onclick = () => {
  try {
    if(!state.active) return;
    const response=val("observation");
    if(!response) throw new Error("Enter an observation before capturing the response.");
    transitionTrial(state.active,"response_captured",{at:stamp(),response_time_ms:Math.round(performance.now()-state.startedAt),observation:{response_text:response,recorded_by:"operator",format:state.protocol.task.response_format}});
    transitionTrial(state.active,"completed",{at:stamp()});
    sealTrial(state.active,{at:stamp()});
    state.active=null; $("activeInfo").textContent="No active trial."; $("observation").value="";
    say("Trial completed and sealed. Raw observation retained; no aggregate score calculated."); update();
  } catch(e) { reportError(e); }
};
$("abort").onclick = () => {
  try {
    if(!state.active) return;
    transitionTrial(state.active,"aborted",{at:stamp(),reason:val("abortReason")||"Operator aborted trial."});
    sealTrial(state.active,{at:stamp()}); state.active=null;
    $("activeInfo").textContent="No active trial."; say("Trial aborted and retained in the session record."); update();
  } catch(e) { reportError(e); }
};
$("export").onclick = () => {
  if(!state.session) return;
  const output={schema:"OBSERVOR-2.0-SESSION",schema_version:"1.0.0",exported_at:stamp(),protocol:state.protocol,session:{...state.session,trials:state.session.trials},provenance:{instrument_build:"OBSERVOR-2.0-recorder-dev",storage:"browser-memory-only-until-export",identity_inference:"not_performed",analysis:"raw_records_only"}};
  const blob=new Blob([JSON.stringify(output,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="observor-2.0-session.json"; a.click(); URL.revokeObjectURL(url);
  say("JSON export generated from the in-memory session.");
};
update();
