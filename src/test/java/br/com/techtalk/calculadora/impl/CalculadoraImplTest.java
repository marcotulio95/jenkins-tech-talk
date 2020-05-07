package br.com.techtalk.calculadora.impl;

import junit.framework.TestCase;
import org.junit.Test;


public class CalculadoraImplTest extends TestCase {

    CalculadoraImpl calculadora = new CalculadoraImpl();

    @Test
    public void testSomar(){
        Double number1 = Double.valueOf(5);
        Double number2 = Double.valueOf(2);

        Double result = calculadora.somar(number1, number2);
        assertEquals("5+2=7", Double.valueOf(7), result);
    }

    @Test
    public void testSubtrair(){
        Double number1 = Double.valueOf(5);
        Double number2 = Double.valueOf(2);
        Double result = calculadora.subtrair(number1, number2);
        assertEquals("5-2=3", Double.valueOf(3), result);
    }

    @Test
    public void testMultiplicar(){
        Double number1 = Double.valueOf(2);
        Double number2 = Double.valueOf(8);
        Double result = calculadora.multiplicar(number1, number2);
        assertEquals("2*8=16", Double.valueOf(16), result); // TODO multiplicar is wrong
    }

    @Test
    public void testDividir(){
        Double number1 = Double.valueOf(8);
        Double number2 = Double.valueOf(2);
        Double result = calculadora.dividir(number1, number2);
        assertEquals("8/2=4", 4, result); // TODO false postive here
    }

}