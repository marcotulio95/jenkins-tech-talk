package br.com.techtalk.calculadora.impl;

import br.com.techtalk.calculadora.Calculadora;

import javax.management.MXBean;


public class CalculadoraImpl implements Calculadora {
    @Override
    public Double somar(Double number1, Double number2) {
        return number1+number2;
    }

    @Override
    public Double subtrair(Double number1, Double number2) {
        return number1-number2;
    }

    @Override
    public Double multiplicar(Double number1, Double number2) {
        return number1*number2;
    }

    @Override
    public Double dividir(Double number1, Double number2) {
        return number1*number2; // TODO It's wrong as example
    }
}
