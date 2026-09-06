import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import { javascriptGenerator, Order } from 'blockly/javascript';

// blockly/msg/en exports message strings as a plain object -- it doesn't
// populate Blockly.Msg on its own (confirmed the hard way: without this,
// things like the "Make a Variable" button literally render the text
// "%{BKY_NEW_VARIABLE}" instead of substituting it). Merging directly
// into Msg's existing object (not reassigning the reference, which
// TypeScript's own types confirm is always a real object) plus calling
// the official setLocale if present covers this regardless of exactly
// which module-resolution path is in play.
Object.assign(Blockly.Msg, En);
(Blockly as unknown as { setLocale?: (msgs: object) => void }).setLocale?.(En);

// ---------------------------------------------------------------------------
// Starter block set for PixelCode v1: Events, Motion, Looks, Control, Sound.
// Each block is defined once here (shape + generator) and referenced by
// name from the toolbox in CodingEditor.tsx.
//
// Blocks generate plain JavaScript strings via Blockly's javascriptGenerator.
// The interpreter (src/lib/interpreter.ts) wraps that generated code in an
// async function and runs it against a `api` object it provides -- see
// that file for what api.* methods exist and how Stop is implemented.
// ---------------------------------------------------------------------------

const HAT_COLOUR = '#FFAB19'; // events
const MOTION_COLOUR = '#4C97FF';
const LOOKS_COLOUR = '#9966FF';
const CONTROL_COLOUR = '#FFAB19';
const SOUND_COLOUR = '#CF63CF';

Blockly.Blocks['event_whenflagclicked'] = {
  init() {
    this.appendDummyInput().appendField('when ▶ clicked');
    this.setNextStatement(true);
    this.setColour(HAT_COLOUR);
    this.setTooltip('Runs the scripts below when Run is pressed.');
  },
};
javascriptGenerator.forBlock['event_whenflagclicked'] = () => '';
// This is a hat block -- CodingEditor.tsx finds top-level blocks of this
// type and generates/runs the statements stacked beneath each one; the hat
// itself emits no code.

Blockly.Blocks['motion_movesteps'] = {
  init() {
    this.appendValueInput('STEPS').setCheck('Number').appendField('move');
    this.appendDummyInput().appendField('steps');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(MOTION_COLOUR);
  },
};
javascriptGenerator.forBlock['motion_movesteps'] = (block, gen) => {
  const steps = gen.valueToCode(block, 'STEPS', Order.NONE) || '0';
  return `await api.move(${steps});\n`;
};

Blockly.Blocks['motion_turn'] = {
  init() {
    this.appendValueInput('DEGREES').setCheck('Number').appendField('turn ↻');
    this.appendDummyInput().appendField('degrees');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(MOTION_COLOUR);
  },
};
javascriptGenerator.forBlock['motion_turn'] = (block, gen) => {
  const degrees = gen.valueToCode(block, 'DEGREES', Order.NONE) || '0';
  return `await api.turn(${degrees});\n`;
};

Blockly.Blocks['motion_gotoxy'] = {
  init() {
    this.appendValueInput('X').setCheck('Number').appendField('go to x:');
    this.appendValueInput('Y').setCheck('Number').appendField('y:');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(MOTION_COLOUR);
  },
};
javascriptGenerator.forBlock['motion_gotoxy'] = (block, gen) => {
  const x = gen.valueToCode(block, 'X', Order.NONE) || '0';
  const y = gen.valueToCode(block, 'Y', Order.NONE) || '0';
  return `await api.goTo(${x}, ${y});\n`;
};

Blockly.Blocks['looks_say'] = {
  init() {
    this.appendValueInput('TEXT').setCheck('String').appendField('say');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(LOOKS_COLOUR);
  },
};
javascriptGenerator.forBlock['looks_say'] = (block, gen) => {
  const text = gen.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return `await api.say(${text});\n`;
};

Blockly.Blocks['looks_sayforsecs'] = {
  init() {
    this.appendValueInput('TEXT').setCheck('String').appendField('say');
    this.appendValueInput('SECS').setCheck('Number').appendField('for');
    this.appendDummyInput().appendField('seconds');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(LOOKS_COLOUR);
  },
};
javascriptGenerator.forBlock['looks_sayforsecs'] = (block, gen) => {
  const text = gen.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const secs = gen.valueToCode(block, 'SECS', Order.NONE) || '1';
  return `await api.sayFor(${text}, ${secs});\n`;
};

Blockly.Blocks['looks_show'] = {
  init() {
    this.appendDummyInput().appendField('show');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(LOOKS_COLOUR);
  },
};
javascriptGenerator.forBlock['looks_show'] = () => 'await api.show();\n';

Blockly.Blocks['looks_hide'] = {
  init() {
    this.appendDummyInput().appendField('hide');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(LOOKS_COLOUR);
  },
};
javascriptGenerator.forBlock['looks_hide'] = () => 'await api.hide();\n';

Blockly.Blocks['looks_nextcostume'] = {
  init() {
    this.appendDummyInput().appendField('next costume');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(LOOKS_COLOUR);
  },
};
javascriptGenerator.forBlock['looks_nextcostume'] = () => 'await api.nextCostume();\n';

Blockly.Blocks['control_wait'] = {
  init() {
    this.appendValueInput('SECS').setCheck('Number').appendField('wait');
    this.appendDummyInput().appendField('seconds');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(CONTROL_COLOUR);
  },
};
javascriptGenerator.forBlock['control_wait'] = (block, gen) => {
  const secs = gen.valueToCode(block, 'SECS', Order.NONE) || '1';
  return `await api.wait(${secs});\n`;
};

Blockly.Blocks['control_repeat'] = {
  init() {
    this.appendValueInput('TIMES').setCheck('Number').appendField('repeat');
    this.appendStatementInput('DO');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(CONTROL_COLOUR);
  },
};
javascriptGenerator.forBlock['control_repeat'] = (block, gen) => {
  const times = gen.valueToCode(block, 'TIMES', Order.NONE) || '0';
  const body = gen.statementToCode(block, 'DO');
  const loopVar = gen.nameDB_!.getDistinctName('count', Blockly.Names.NameType.VARIABLE);
  return `for (let ${loopVar} = 0; ${loopVar} < ${times}; ${loopVar}++) {\n  if (!api.isRunning()) return;\n${body}}\n`;
};

Blockly.Blocks['control_forever'] = {
  init() {
    this.appendDummyInput().appendField('forever');
    this.appendStatementInput('DO');
    this.setPreviousStatement(true);
    this.setColour(CONTROL_COLOUR); // no next-statement -- forever never falls through
  },
};
javascriptGenerator.forBlock['control_forever'] = (block, gen) => {
  const body = gen.statementToCode(block, 'DO');
  return `while (api.isRunning()) {\n${body}  await api.tick();\n}\n`;
};

// Populated by CodingEditor whenever the student's sound list changes.
// Blockly's FieldDropdown re-invokes this function every time the dropdown
// is opened, so it always reflects the current list without needing to
// rebuild any blocks already on the workspace.
let availableSoundOptions: [string, string][] = [['(beep)', '__beep__']];

export function setAvailableSounds(sounds: { id: string; name: string }[]) {
  availableSoundOptions = [
    ['(beep)', '__beep__'],
    ...sounds.map((s): [string, string] => [s.name, s.id]),
  ];
}

Blockly.Blocks['sound_play'] = {
  init() {
    this.appendDummyInput()
      .appendField('play sound')
      .appendField(new Blockly.FieldDropdown(() => availableSoundOptions), 'SOUND');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(SOUND_COLOUR);
    this.setTooltip('Upload sounds from the Sounds panel to add more options here.');
  },
};
javascriptGenerator.forBlock['sound_play'] = (block) => {
  const soundId = block.getFieldValue('SOUND');
  return `await api.playSound(${JSON.stringify(soundId)});\n`;
};

// ---------------------------------------------------------------------------
// Override Blockly's BUILT-IN procedure generators (used by the Functions
// toolbox category below). By default they emit plain synchronous
// `function name() {...}` / `name();` -- but every custom block above
// generates `await api.*(...)`, so a function containing one of them would
// be a syntax error unless it's declared `async`. This override keeps
// Blockly's own logic (nameDB_ lookups, argument handling) but changes
// the two lines that matter: `async function` instead of `function`, and
// `await name(...)` instead of a bare call.
// ---------------------------------------------------------------------------
javascriptGenerator.forBlock['procedures_defnoreturn'] = (block, gen) => {
  const funcName = gen.nameDB_!.getName(block.getFieldValue('NAME'), Blockly.Names.NameType.PROCEDURE);
  const branch = gen.statementToCode(block, 'STACK');
  const args = ((block as any).arguments_ || []).map((argName: string) =>
    gen.nameDB_!.getName(argName, Blockly.Names.NameType.VARIABLE),
  );
  const code = `async function ${funcName}(${args.join(', ')}) {\n${branch}}\n`;
  (gen as any).definitions_[funcName] = code;
  return null;
};

javascriptGenerator.forBlock['procedures_callnoreturn'] = (block, gen) => {
  const funcName = gen.nameDB_!.getName(block.getFieldValue('NAME'), Blockly.Names.NameType.PROCEDURE);
  const args = ((block as any).arguments_ || []).map((_: string, i: number) =>
    gen.valueToCode(block, 'ARG' + i, Order.NONE) || 'null',
  );
  return `await ${funcName}(${args.join(', ')});\n`;
};

export const TOOLBOX_XML = `
<xml>
  <category name="Events" colour="${HAT_COLOUR}">
    <block type="event_whenflagclicked"></block>
  </category>
  <category name="Motion" colour="${MOTION_COLOUR}">
    <block type="motion_movesteps"><value name="STEPS"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>
    <block type="motion_turn"><value name="DEGREES"><shadow type="math_number"><field name="NUM">15</field></shadow></value></block>
    <block type="motion_gotoxy">
      <value name="X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    </block>
  </category>
  <category name="Looks" colour="${LOOKS_COLOUR}">
    <block type="looks_say"><value name="TEXT"><shadow type="text"><field name="TEXT">Hello!</field></shadow></value></block>
    <block type="looks_sayforsecs">
      <value name="TEXT"><shadow type="text"><field name="TEXT">Hello!</field></shadow></value>
      <value name="SECS"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
    </block>
    <block type="looks_show"></block>
    <block type="looks_hide"></block>
    <block type="looks_nextcostume"></block>
  </category>
  <category name="Control" colour="${CONTROL_COLOUR}">
    <block type="control_wait"><value name="SECS"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>
    <block type="control_repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>
    <block type="control_forever"></block>
  </category>
  <category name="Sound" colour="${SOUND_COLOUR}">
    <block type="sound_play"></block>
  </category>
  <category name="Variables" custom="VARIABLE" colour="#FF8C1A"></category>
  <category name="Lists" colour="#FF661A">
    <block type="lists_create_with"></block>
    <block type="lists_length"></block>
    <block type="lists_isEmpty"></block>
    <block type="lists_indexOf"></block>
    <block type="lists_getIndex"></block>
    <block type="lists_setIndex"></block>
    <block type="lists_repeat"><value name="NUM"><shadow type="math_number"><field name="NUM">5</field></shadow></value></block>
  </category>
  <category name="Functions" custom="PROCEDURE" colour="#FF6680"></category>
  <category name="Math" colour="#59C059">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
    <block type="math_round"></block>
    <block type="math_modulo"><value name="DIVIDEND"><shadow type="math_number"><field name="NUM">10</field></shadow></value><value name="DIVISOR"><shadow type="math_number"><field name="NUM">3</field></shadow></value></block>
    <block type="math_random_int"><value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>
  </category>
  <category name="Logic" colour="#59C059">
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="Text" colour="#59C059">
    <block type="text"></block>
    <block type="text_join"></block>
    <block type="text_length"></block>
  </category>
</xml>
`;
