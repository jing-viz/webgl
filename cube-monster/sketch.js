
class rule_def
{
    // var weight;//for random choose
    // float geom_size;
    // var geom_type;
    // p5.Vector r1, s1, t1;//for recursive
    // p5.Vector r2, s2, t2;//for take action
    constructor()
    {
        this.weight = 1;
        this.geom_size = 5.0;
        this.geom_type = 0;
    }
}

rule_def.e_box = 0;
rule_def.e_sphere = 1;
rule_def.e_none = 2; 


class rule_def_list
{
    // var rules [];
    // var weight_sum;
    // var max_depth;

    constructor(max_dep)
    {
        this.weight_sum = 0;
        this.max_depth = max_dep;
        this.rules = [];
    }

    add(rule)
    {
        this.rules.push(rule);
        var n = rules.length;
        this.weight_sum = 0;
        for (var i=0;i<n;i++)
            this.weight_sum += get(i).weight;
    }

    get(idx)
    {
        return this.rules[idx];
    }

    getNextRule(m, n, o)
    {
        var nRules = this.rules.length;
        var k = parseInt((this.weight_sum)*noise(m, n, o));

        var sum = 0;
        for (var i=0;i<nRules;i++)
        {
            sum += this.get(i).weight;
            if (sum >= k)
            {
                //  println(i);
                return this.get(i);
            }
        }
        return null;
    }
}

function by_rule(i, j, depth, rules, trans, rot, scal)
{
    //        { s 0.9 rz 5 h 5 rx 5 x 1 }  r1
    //        { s 1 0.2 0.5 } box

    let rule = rules.getNextRule(i, j, depth);
    if (rule == null)
        return;

    // console.log(rule);
    push();

    if (rule.geom_type == rule_def.e_box)
    {
        rotateX(rot.x);
        rotateY(rot.y);
        rotateZ(rot.z);
        scale(scal.x, scal.y, scal.z);
        translate(trans.x, trans.y, trans.z);
        let gray = parseInt(255*noise(i, j));

        let k = depth/(rules.max_depth + 0.01);

        if (k < 0.4 && noise(i, k) > 0.6)
        {
            fill(0, 0, gray, 200);
            box(5.5, 1.5, 1.5);
        }
        else if (k < 0.85)
        {
            fill(gray, 200);
            box(5, 0.7, 1.4);
        }
        else
        {
            fill(gray, 30, 30, 255);
            box(5, 1.4, 0.7);
        }
        if (depth < rules.max_depth)
        {
            depth++;
            let t = rule.t1;
            let r = rule.r1;
            let s = new p5.Vector();
            s.set(rule.s1.x, rule.s1.y, rule.s1.z);

            by_rule(i, j, depth, rules, t, r, s);
        }
    }

    pop();
}

let rules;

function setup()
{
    createCanvas(480, 854, WEBGL);
    noStroke();

    let rule1 = new rule_def();
    //        rule r1 w 20 {
    //            { s 0.9 rz 5 h 5 rx 5 x 1 }  r1
    //            { s 1 0.2 0.5 } box
    //        }
    rule1.weight = 20;
    rule1.geom_type = rule_def.e_box;
    rule1.geom_size = 3.0;
    rule1.t1 = new p5.Vector(5, 0, 0);
    rule1.r1 = new p5.Vector(3, 3, 3);
    rule1.s1 = new p5.Vector(1, 0.95, 0.95);
    rule1.s2 = new p5.Vector(1, 0.5, 0.2);

    let rule2 = new rule_def();
    //        rule r1 w 20 {
    //            {  s 0.99 rz -5 h 5 rx -5 x 1 }   r1
    //            { s 1 0.2 0.5 } box
    //        }
    rule2.weight = 20;
    rule2.geom_type = rule_def.e_box;
    rule2.geom_size = 3.0;
    rule2.t1 = new p5.Vector(5, 0, 0);
    rule2.r1 = new p5.Vector(-3, 3, -3);
    rule2.s1 = new p5.Vector(1, 0.99, 0.99);
    rule2.s2 = new p5.Vector(1, 0.2, 0.5);

    let rule3 = new rule_def();
    rule3.weight = 24;
    //        rule r1  {
    //        }

    rules = new rule_def_list(5);
    rules.add(rule1);
    rules.add(rule2);
    rules.add(rule3);
}

let counter = 0;
let inc = 1;
let cam_x=0;

function draw()
{
    background(122);

    cam_x+=0.02;
    //  camera(100*cos(cam_x),0,100*sin(cam_x),0,0,0,0,1,0); 
    // translate(width/2, height/2, 0);
    scale(7);
    rotateX(0.008*(frameCount));
    rotateY(0.004*(frameCount));

    if (counter++ > 15)
    {
        rules.max_depth += inc;
        if (rules.max_depth > 15 && inc > 0)
            inc = -1;
        else     if (rules.max_depth < 5 && inc < 0)
            inc = +1;   
        counter = 0;
    }

    //10 * { ry 36 sat 0.9 } 30 * { ry 10 } 1 * { h 30 b 0.8 sat 0.8 a 0.3  } r1
    let pos0 = new p5.Vector();
    let rot0 = new p5.Vector();
    let scale0 = new p5.Vector(1, 1, 1);

    for (var i=0;i<20;i++)
    {
        rot0.y += 18;
        rot0.z = 0;
        for (var j=0; j< 20; j++)
        {
            rot0.z += 18;
            by_rule(i, j, 0, rules, pos0, rot0, scale0);
        }
    }
}
