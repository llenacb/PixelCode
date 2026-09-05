import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

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

Blockly.Blocks['sound_play'] = {
  init() {
    this.appendDummyInput().appendField('play sound: pop');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(SOUND_COLOUR);
    this.setTooltip('Sound library comes in a later build phase -- this plays a built-in beep for now.');
  },
};
javascriptGenerator.forBlock['sound_play'] = () => 'await api.playSound();\n';

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
  </category>
  <category name="Control" colour="${CONTROL_COLOUR}">
    <block type="control_wait"><value name="SECS"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>
    <block type="control_repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>
    <block type="control_forever"></block>
  </category>
  <category name="Sound" colour="${SOUND_COLOUR}">
    <block type="sound_play"></block>
  </category>
  <category name="Math" colour="#59C059">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
  </category>
  <category name="Text" colour="#59C059">
    <block type="text"></block>
  </category>
</xml>
`;
