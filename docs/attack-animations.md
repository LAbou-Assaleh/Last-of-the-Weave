# Attack Animation Requirements

## Overview
Based on the review of the current implementation, we need to add visible animations to indicate when attacks are occurring in the game. Currently, there are no visual indicators for attacks beyond a hit effect when damage is taken.

## Player Attack Animations
1. **Melee Attack Animation**
   - Visual indicator extending from player in the direction of the target
   - Animation should match the character type (warrior, mage, ranger)
   - Duration should be brief but noticeable (200-300ms)
   - Should be triggered in the `attack()` method

2. **Attack Cooldown Indicator**
   - Visual feedback showing when the next attack is ready
   - Could be a subtle pulsing effect or color change
   - Should be tied to the `attackSpeed` stat

3. **Range Indicator**
   - Optional: Subtle visual indicator of attack range
   - Could be shown temporarily when enemies are nearby

## Enemy Attack Animations
1. **Enemy Attack Visuals**
   - Different animations based on enemy type (basic, fast, tank, boss)
   - Direction-based animation pointing toward the player
   - Duration should match the attack speed
   - Should be triggered in the `attack()` method

2. **Enemy Preparation**
   - Optional: "Wind up" animation for slower enemies
   - Gives player visual warning before attack

## Damage Effects
1. **Impact Effects**
   - Visual effect at the point of impact
   - Different effects based on damage amount
   - Should be visible but not obscure gameplay

2. **Damage Numbers**
   - Floating numbers showing damage amount
   - Different colors based on damage type or critical hits

## Technical Implementation
1. **Animation System**
   - Add `attackAnimation` property to track animation state
   - Add methods to handle animation lifecycle
   - Use canvas drawing techniques for the animations

2. **Event Integration**
   - Leverage existing event system (`player:attack`, `enemy:attack`)
   - Add animation triggers to these events

3. **Performance Considerations**
   - Animations should be lightweight
   - Should degrade gracefully on lower-end devices
   - Option to reduce visual effects if needed

## Priority Order
1. Basic player attack animations
2. Basic enemy attack animations
3. Impact effects
4. Damage numbers
5. Advanced animations (cooldown indicators, preparation effects)
